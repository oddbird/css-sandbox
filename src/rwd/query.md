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

Since the contents of a block can impact it's size,
this would require both [layout](#layuot-containment)
and [size](#size-containment) containment
to avoid infinite style loops.

## Resources

- David Baron:
  [Thoughts on an implementable path forward](https://github.com/dbaron/container-queries-implementability)
- W3C: [CSS Containment Module](https://drafts.csswg.org/css-contain/)
- Chrome: [Container Queries Project](https://docs.google.com/document/d/1ekz9JNJVQnvt_Xxd1BmanJpamGApyp5vRW_hpuh24h8/edit?usp=sharing)

## Understanding Containment

Layout and Size containment are supported
in all major evergreen browsers:

```css
.sidebar {
  contain: layout size;
}
```

### [Layout Containment](https://drafts.csswg.org/css-contain/#containment-layout)

Isolates the layout-impact of contents in several ways:

- Generates an [independent formatting context](https://drafts.csswg.org/css-display-3/#independent-formatting-context)
- Contains fragmentation-flow (CSS Regions)
  and forced fragmentation breaks (`break-before`, `break-after`)
- Any `visible`/`clip` overflow is
  [ink only](https://drafts.csswg.org/css-overflow-3/#ink-overflow)
- Creates a positioning context for both `absolute` & `fixed` children
- Creates a stacking context for `z-index`
- For alignment, the box is treated as though it has no baseline

This ensures that:

- The contents of a layout container
  will not impact the layout of contents in another container
- Layout can be delayed if the container is off-screen,
  and will not effect on-screen boxes
  (e.g. it's farther down in a block context)

### [Size Containment](https://drafts.csswg.org/css-contain/#containment-size)

Isolates the size-impact of contents:

- Intrinsic size & final layout size are determined
  as though the container is empty
- Fragmentation is contained

This feature primarily exists to make container queries possible.
When combined with layout containment, it allows:

- Rendering engines to optomize performance
  by ensuring that internal changes
  will never require external layout adjustments
- Off-screen rendering can be delayed

### Is single-axis containment even possible?

CSSWG [1D containment issue](https://github.com/w3c/csswg-drafts/issues/1031)

2-axis size containment might work for some app-style layouts,
where layout areas are sized to the viewport,
and each area is a scroll-container.
But most web layout relies on specifying inline-size (often horizontal),
and allowing content to expand or contract
on the block-axis (often vertical).

We need container queries to support that more common use-case.

Single-axis containment only works
if we can ensure that changes in the cross-axis
have no impact on the contained axis.
There are several places where CSS makes that difficult:

#### Scrollbars

When a parent element has `auto` scrolling,
extra cross-axis size can cause scrollbars
to appear on the contained-axis.
This is only an issue when all three are true:

- Scrollbars are part of the layout flow (they are not overlayed)
- Overflow on the cross-axis is set to `auto` on _any ancestor_
- The container size is impacted by the size of that ancestor

This could be solved by forcing `auto` scrollbars in that instance
to be always-visible on the cross-axis,
when any contents have 1D size containment.

#### Percentage Margins & Padding

Block-axis percentage padding & margins
are resolved relative to the inline available size.

https://codepen.io/anon/pen/aYQLvV?editors=1100

One proposed resolution is to limit single-axis containment
to the inline axis (the more common use-case),
since this issue only flows from inline-to-block.
That would require some consideration
for nested writing mode changes...

## Other Issues

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
But I don't think scope and container-queries
actually combine that cleanly for every use-case.
While there is some overlap,
this syntax doesn't fully capture either
scope or container-query requirements.

The explicit selector
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

I think we're making different assumptions
to answer the question:
**Do individual components always create their own containment context,
or do responsive components get added to an external context?**
David's approach would rely on each component
describing it's own containment,
where I'm proposing that containment might be external.

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

Am I missing something?

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
