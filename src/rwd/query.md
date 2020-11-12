---
title: Container Queries
eleventyNavigation:
  key: container-queries
  title: Container Queries
  parent: rwd
---

Since container-queries are often seen as
an extension of media-queries,
the most common proposal is to add an `@`-rule
block syntax that works similar to existing `@media`.

Since the contents of a block can impact it's size,
this would require both `layout` and `size` containment
to avoid infinite style loops.

## Resources

- David Baron:
  [Thoughts on an implementable path forward](https://github.com/dbaron/container-queries-implementability)
- W3C: [CSS Containment Module](https://drafts.csswg.org/css-contain/)

## Issues

### Is single-axis containment even possible?

CSSWG [1D containment issue](https://github.com/w3c/csswg-drafts/issues/1031)

Single-axis containment only works
if we can ensure that changes in the cross-axis
have no impact on the contained axis.
There are several places where CSS makes that difficult:

- Extra cross-axis size
  can trigger scrollbars on the contained-axis.
- Block-axis percentage-padding
  is relative to the inline axis.
- _are there other?_

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
But I don't think scope and container-queries
actually combine that cleanly for every use-case.

The explicit selector requirement
makes it impossible to have fully-modular components
that respond to _any context_.
I'd want a syntax that allows for
_implicit_ containers (much like positioning context)
created whenever the required _containment_ is applid to an element:

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

I think this is a re-framing of the question:
**Do individual components always create their own context,
or can components get added to an external context?**
I think David is assuming each component
describes it's own containment context,
where I'm proposing that containment might be external.

#### Is Implicit Containment Dangerous?

==TODO: Sometimes implicit context can be confusing…==

### Should we build this into `@media`? [❌]

My immediate instinct was that container-queries
really are the same as media-queries,
and we could handle both in the existing `@`-rule --
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
