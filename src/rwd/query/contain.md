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
- The contained size is impacted by the size of that ancestor

This could be solved by
forcing in-flow `auto` scrollbars to be always-visible
when there are nested single-axis containers.

### Percentage Padding

Block-axis percentage padding & margins
are resolved relative to the inline available size.
That would cause issues when:

- Containment is on the block-axis
- Any ancestor has inline-size determined by contents
  (float+auto, min-content, max-content, etc)
- Any intermediate ancestor has:
  - box-sizing of border-box
  - height determined by the outer ancestor
  - % padding on the block-axis
    (so inner-height decreases as outer-width increases)
- The container block-size is impacted
  by the inner-size of that ancestor

See
[contain-y comment](https://github.com/w3c/csswg-drafts/issues/1031#issuecomment-379463428))
and related
[codepen demo](https://codepen.io/anon/pen/aYQLvV?editors=1100).

That issue is most likely to occur
when containing the block-axis,
but nested writing modes
can flip the impacted axis
([contain-x with writing modes](https://github.com/w3c/csswg-drafts/issues/1031#issuecomment-722980450)).

It's interesting that browsers
are already inconsistent about rendering that last demo.
They also disagree on simpler
[percentage calculations](https://codepen.io/mirisuzanne/pen/9f46dc0b9e57f0f2e0cd46b6b5898d67?editors=1100)
when "in a particular axis,
the containing block’s size depends on the box’s size"
[[Box Sizing 3](https://www.w3.org/TR/css-sizing-3/#sizing-values)].

The sizing/layout specs all have
module-specific caveats for handling those cases.
This seems to me like it could be solved
with one more caveat?
Not solved as in _perfect layout_,
but at least _consistent & implementable_,
without infitine loops.

I have trouble imagining actual use-cases
that would require this to behave well.


### Notes towards a resolution

I'm not an expert on rendering engines,
but I imagine something like this:

When determining the size-contribution
of a single-axis container:

1. For the sake of determining auto scrollbars,
   the container contributes an infinite cross-axis size
   (always trigger the scrollbar)
2. For the sake of resolving percentages on the contained axis...
   1. the contribution is determined without any input
      from the contents on either axis
      (as though contained on both dimensions)
   2. alternately, these percentages could always resolve to `auto`

The main difference from most existing caveats
is that no second-pass re-calculation would be allowed.

I think #1 might be a fairly common issue --
and a somewhat surprising result.
Auto overflow exists _because_
no one wants a useless scrollbar
just sitting around.

I have trouble imagining real use-cases
that would be impacted by #2.
This sort of cross-axis % padding
is often used to manage aspect-ratios,
but I don't think that case would be affected
(and also relies on a 0 intrinsic-size contribution).
