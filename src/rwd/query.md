---
title: Container Queries
eleventyNavigation:
  key: container-queries
  title: Container Queries
  parent: rwd
---

Since container-queries are often seen as
an extension of media-queries,
the most common proposal is to add an @-rule
block syntax that works similar to existing `@media`.

**Contents:**

[[toc]]

## Resources

- David Baron:
  [Thoughts on an implementable path forward](https://github.com/dbaron/container-queries-implementability)
- W3C: [CSS Containment Module](https://drafts.csswg.org/css-contain/)
- Chrome: [Container Queries Project](https://docs.google.com/document/d/1ekz9JNJVQnvt_Xxd1BmanJpamGApyp5vRW_hpuh24h8/edit?usp=sharing)
- Chrome: [Intent to Prototype](https://groups.google.com/a/chromium.org/g/blink-dev/c/u1AKdrXhPGI/m/wrJb-unhAgAJ?pli=1)
- My [notes on containment](../contain/)

## Syntax Proposal

The Chrome I2P contains a link to
my initial [gist](https://gist.github.com/mirisuzanne/748169312f110d6246e092945673b16e).
I threw that together in a hurry,
simply trying to describe the problem with mixing
scope & containment.

Both that Gist and this document
lean heavily on David Baron's
initial proposal.

Here is my current thinking...

### Creating Container Context

What's required for a containment context is:

```css
.sidebar,
.main {
  contain: layout inline-size;
}
```

But that feels a bit arbitrary.
Would there be a way to clean it up?

```css
.sidebar,
.main {
  contain: queries; /* extending contain */
  display: container; /* extending display */
}
```

==TODO: this needs a bit more thought...==

### Querying Context

```css
/* @container <query> [, <query>]* */
@container (width > 45em) {
  /* media-objects inside main or aside, or any other "contained" element */
  .media-object {
    grid-template: 'img content' auto / auto 1fr;
  }
}
```

This would target
any `.media-object` who's
_containment context_
(nearest ancestor with containment applied)
is greater-than `45em`.

## Questions

### Size & Layout Containment

Since the contents of a block can impact it's size,
this would require both [layout](#layuot-containment)
and [size](#size-containment) containment
to avoid infinite style loops.

But authors would likely need
[single-axis containment](../contain/).
Is that even possible?

### Interleaving Layout & Style

Browser engine rendering relies on discreet stages:

1. **Style Calculation** matches selectors to elements,
   and applies cascading/inheritance logic
   to determine a value for every property
   on every element
2. **Layout** applies all sizing-related properties
   to determine the size & position of each element on the page
3. **Paint** determines the color to paint each individual pixel
   in isolated "layers"
4. **Composite** maps the overlap of layers,
   to determine final pixel values

For elements relying on a container query,
internal style calculation would need to happen
_after_ external layout has concluded.

### @-Rule or Selector? [👍 @-rule]

There are two general approaches to a syntax:

```css
/* @-rule block */
@container <query> {
  .selector { /* ... */ }
}

/* pseudo-class */
.selector:media(<query>) { /* ... */ }
```

I don't think the selector approach makes sense here,
since it's likely that a responsive component
will have multiple moving parts,
and each might require a unique selector
at the same breakpoint.

### Required Scope?

David Baron's proposal requires
an explicit selector for defining the container,
and attaches the concept of [scope](/scope/):

```css
/* syntax */
@container <selector> (<container-media-query>)? {
  /* ... */
}

/* example */
@container .media-object (width > 45em) {
  .media-object {
    grid-template: 'img content' auto / auto 1fr;
  }
}
```

In that syntax, an explicit scope is required,
while the query is optional.
I have several issues with this,
but a lot of it boils down to:

- David's proposal assumes that each component will define
  it's own containment internally.
- I think that components should always refer to a parent container,
  so the containment is external.

That both complicates the usefulness of
having an explicit container to match for queries,
and the usefulness of mixing scope with queries in the first place.

I think both features will be better-served by having their own syntax.

#### Implicit Containers

The explicit selector
makes it impossible to have fully-modular components
that respond to _any context_.
I'd want a syntax that allows for
_implicit_ containers (much like positioning context)
created whenever the required _containment_ is applied to an element:

```css
/* both aside & main become "implicit containers" */
main,
aside {
  contain: inline-size layout;
}

/* media-object can respond to either container */
@container (width > 45em) {
  .media-object {
    grid-template: 'img content' auto / auto 1fr;
  }
}
```

#### The Container Itself

David's syntax proposal raises two big questions:

- Can selectors inside the query reference the queried element itself?
- If so, what properties can be adjusted without infinite looping?

If the query can apply adjustments to the container,
we have infinite-loop problems --
unless we limit the properties that can be
applied to this self-referential query.
That sounds very much like the limitations
imposed by `switch()`.

Implicit containers avoid those issues
by ensuring that every container-query is matching
an extrnal container.
There is no way to select the container
being queried.

#### Are Implicit Containers Dangerous?

Implicit _positioning context_ sometimes creates a problem,
if you want an absolutely-positioned child
relative to a grandparent container,
but you also need to position the parent.

> Connecting this to contain:size means you cannot have
> a contain:size between the element you are styling
> and the container query you are responding to.
> That is, if you have nested contain:size,
> you cannot base your styles on the outer one.
> Is that a fair limitation?

I can't think of any reason to contain size on a parent,
but have the child continue to ignore that containment.
The goal is to respond to available size,
and parent size containment impacts available size.

Would it be possible, though,
to make query-containment explicit
without any interference from other uses
of the `contain` property?
What comes to mind is a `display-outside` value
of `container`.

### What Do We Query?

- Are queries limited to container dimensions?
- Are relative units like `em`/`rem` resolved to the container value?
- Can we query other values on the container,
  like custom properties?

==TODO: Needs more thought & input==

### Should we build this into `@media`? [❌]

My immediate instinct was that container-queries
really are the same as media-queries,
and we could handle both in the existing @-rule --
something like:

```css
@media screen and container(width > 45em) { /* ... */ }
```

The immediate issue is that font-relative sizes in `@media`
resolve based on the inherited viewport font size,
before any document styles are applied.
But container queries refer to a specific element in the DOM,
and should ideally resolve based on that element's styles.

I think that reflects a broader issue:
"media" may be a part of "context" --
but they are fairly different concepts in practice.
