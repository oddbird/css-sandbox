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

## Status

- Blocker: [Single-Axis Containment](contain/)
- Chrome: [Intent to Prototype](https://groups.google.com/a/chromium.org/g/blink-dev/c/u1AKdrXhPGI/m/wrJb-unhAgAJ?pli=1)

## Resources

- David Baron:
  [Thoughts on an implementable path forward](https://github.com/dbaron/container-queries-implementability)
- Matthew Dean: [2019 Proposal/Solution for Container Queries](https://github.com/WICG/container-queries/issues/12)
- W3C: [CSS Containment Module](https://drafts.csswg.org/css-contain/)
- Chrome: [Container Queries Project](https://docs.google.com/document/d/1ekz9JNJVQnvt_Xxd1BmanJpamGApyp5vRW_hpuh24h8/edit?usp=sharing)

## My Notes

{{ collections.all | eleventyNavigation('container-queries') | eleventyNavigationToHtml | typogr | safe }}

## Constraints

### Size & Layout Containment

Since the contents of a block can impact it's size,
this would require both [layout](#layout-containment)
and [size](#size-containment) containment
to avoid infinite style loops.

But authors would likely need
[single-axis containment](contain/).
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
