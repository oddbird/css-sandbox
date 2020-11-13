---
title: Containment
eleventyNavigation:
  key: containment
  title: Containment
  parent: container-queries
---

Layout and Size containment are supported
in all major evergreen browsers:

```css
.sidebar {
  contain: layout size;
}
```

## [Layout Containment](https://drafts.csswg.org/css-contain/#containment-layout)

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

## [Size Containment](https://drafts.csswg.org/css-contain/#containment-size)

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

## Is single-axis containment even possible?

- CSSWG [1D containment issue](https://github.com/w3c/csswg-drafts/issues/1031),
- Brian Kardell's [css-observers issue](https://github.com/bkardell/css-observers/issues/11)

2-axis size containment might work for some app-style layouts,
where layout areas are sized to the viewport,
and each area is a scroll-container.
But most web layout relies on specifying inline-size (often horizontal),
and allowing content to expand or contract
on the block-axis (often vertical).

We need container queries to support that more common use-case.

Conceptually, single-axis containment should not be hard to implement
_if we can describe how it works_.
But that may still be challenging...

Single-axis containment only works
if we can ensure that changes in the cross-axis
have no impact on the contained axis.
There are several places where CSS makes that difficult:

### Scrollbars

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

### Percentage Margins & Padding

Block-axis percentage padding & margins
are resolved relative to the inline available size.

https://codepen.io/anon/pen/aYQLvV?editors=1100

One proposed resolution is to limit single-axis containment
to the inline axis (the more common use-case),
since this issue only flows from inline-to-block.
That would require some consideration
for nested writing mode changes...
