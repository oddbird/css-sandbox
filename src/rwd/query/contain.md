---
title: Containment
created: 2020-11-14
changes:
  - time: 2021-07-05
    log: Known single-axis containment bugs
eleventyNavigation:
  key: containment
  title: Containment
  parent: container-queries
---
{% import "embed.njk" as embed %}

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

- Rendering engines to optimize performance
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
There are several places where CSS makes that difficult.

We have potential solutions to most of the individual issue here.
But the overarching concern is that all these solutions
need to be applied on _arbitrary ancestors of the contained element_,
making their impact expensive for browser engines,
and unpredictable for authors.

{% import "alert.njk" as alert %}
{{ alert.warn('The current Chrome prototype ignores these issues
by making layout stateful in some cases,
which is not a viable cross-browser solution.') }}

### Cross-axis overflow and classic scrollbars

(requires classic scrollbars enabled by the operating system)

{{ embed.codepen('yLbNgMx', 'demo') }}

If any ancestor has overflow on the container's block axis, then additional block-size of the contents can trigger a scrollbar on the cross-axis. Classic scrollbars for block-scrolling take up space on the inline-axis, leaving less space for the container.

This is likely to a very common scenario, impacting the majority of sites that uses inline-size containment, since the viewport itself uses auto-scrollbars.

This could be resolved by applying `overflow-gutter: stable` to the nearest ancestor with `overflow: auto` on the container's block axis. However, `overflow-gutter` is currently limited to a single axis (block-scrolling), and might need to handle inline-scrolling as well, in case the scroller has a writing mode orthogonal to the container.

### %-Padding percentages in Orthogonal Writing Modes

{{ embed.codepen('PomqWVE', 'demo') }}

When padding is applied to the block axis in percentages, those values resolve against the inline-size of the parent. By restricting single-axis containment to the inline axis, we eliminate the majority of these issues. However, it's still possible to apply orthogonal writing modes to any arbitrary ancestor with block-padding that would respond to the (now cross-axis) block size of the container.

- This applies to any ancestor with percentage-based block padding orthogonal to the container
- It doesn't matter what elements switch the writing modes, so long as the container & padding are orthogonal

This could be resolved by "zeroing out" any percentage-padding applied to any ancestor on the containers block-axis.

### Auto-sized BFCs effected by floats

{{ embed.codepen('mdmJRxW', 'demo') }}

The auto-sized Block Formatting Context (created by `overflow:hidden`) finds space for itself among various floated elements. However, as the contents expand vertically, the BFC has to contend with additional floated elements, and resizes. Note that:

- The float/s can be "siblings" or even "cousins" of the BFC
- The BFC can be the container, or _any ancestor_ of the container

This could be resolved by adding `clear: both` to the BFC.

### Aspect ratios (and Orthogonal Writing Modes?)

{{ embed.codepen('abWOJYJ', 'demo') }}

Since aspect-ratio implementations are inconsistent, and may have existing recursion issues (see #6419), I'm not confident that I know what issues here are specific to inline containment. Still it seems like something to keep an eye on - especially when orthogonal writing modes come into play.

I expect this could be resolved in by removing the impact of the preferred aspect ratio. Authors who want to maintain a strict aspect ratio can still do that by applying size containment and defining overflow behavior.
