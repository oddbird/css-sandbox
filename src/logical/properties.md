---
title: Relevant CSS properties, keywords, and functions
created: 2025-06-12T12:54:44-06:00
---

At this point,
I'm documenting everything that has
logical and/or physical syntax --
working through properties in
roughly alphabetical order,
with occasional detours.
This is a first pass,
and does not imply that every syntax
necessarily needs both options,
or that a logical-shorthand syntax
would need to impact all of these.

I've completed a pass,
but there may still be properties
in newer specifications that I missed.

[You can support this effort](https://opencollective.com/oddbird-open-source/contribute/css-logical-shorthands-86141)
or [read more about it](/logical/).

## Multi-value properties

These accept multiple dimensions in a single syntax,
but don't have associated sub-properties
for the dimensions involved.
Ideally, a global toggle would apply here.

- `aspect-ratio` physical (x/y)
- `background`…
  - `background-size` physical (x/y)
  - `background-repeat` physical (x/y) _and keywords_
- `border-image`…
  - `border-image-outset` physical (trbl)
  - `border-image-repeat` physical (x/y)
  - `border-image-slice` physical (trbl)
  - `border-image-width` physical (trbl)
- `box-shadow` physical (x/y)
- `text-shadow` physical (x/y)
- `mask`…
  - `mask-position` physical (x/y) _with offset keywords_
  - `mask-repeat` physical (x/y) _and keywords_
  - `mask-position` physical (x/y)
- `mask-border`…
  - `mask-border-outset` physical (trbl)
  - `mask-border-repeat` physical (x/y)
  - `mask-border-slice` physical (trbl)
  - `mask-border-width` physical (trbl)
- `object-position` physical (x/y) _with offset keywords_
- `offset-position` physical (x/y) _with offset keywords_
- `perspective-origin` physical (x/y) _with offset keywords_
- `transform`…
  - `transform-origin` physical (x/y) _with offset keywords_
  - `rotate` physical (x/y)
  - `scale` physical (x/y)
  - `translate` physical (x/y)

No change needed…

- `border-spacing` logical (columns & rows)
- `column-width` & proposed `column-height` are flow-relative
- `view-timeline-inset` is controlled by `view-timeline-axis`

## Shorthand properties

These shorthands accept dimensions,
which can be set individually using sub-properties.
Some of them have logical as well as physical
long-hand properties available,
while some are missing either the physical or logical alternative.

- `background-position` (`*-x` & `*-y`) _with offset keywords_
  - **missing**: `*-inline` & `*-block`
    ([ED level 4](https://drafts.csswg.org/css-backgrounds-4/), unpublished)
- `size` (`width` & `height`)
  - available: `inline-size` & `block-size`
- `border-width` (`border-<trbl>-width`)
  - available: `border-<axis>-<side>-width`
- `border-style` (`border-<trbl>-style`)
  - available: `border-<axis>-<side>-style`
- `border-color` (`border-<trbl>-color`)
  - available: `border-<axis>-<side>-color`
- `border-radius` (`border-<trbl>-radius`)
  - available: `border-<block>-<inline>-color`
- `border-image` (see sub-properties above)
  - **missing**: logical `-outset`, `-repeat`, `-slice`, & `-width`
- `inset` (`top`, `right`, `bottom`, & `left`)
  - available: `inset-<axis>-<side>`
- `contain-intrinsic-size` (`contain-intrinsic-width` & `*-height`)
  - available: `contain-intrinsic-<axis>-size`
- `margin` (`margin-<trbl>`)
  - available: `margin-<axis>-<side>`
- `scroll-margin` (`scroll-margin-<trbl>`)
  - available: `scroll-margin-<axis>-<side>`
- `padding` (`padding-<trbl>`)
  - available: `padding-<axis>-<side>`
- `scroll-padding` (`scroll-padding-<trbl>`)
  - available: `scroll-padding-<axis>-<side>`
- `mask-border` (see sub-properties above)
  - **missing**: logical `-outset`, `-repeat`, `-slice`, & `-width`
- `overflow` (`overflow-x` & `overflow-y`)
  - available: `overflow-<axis>`
- `overflow-behavior` (`*-x` & `*-y`)
  - available: `overflow-behavior-<axis>`

No change needed…

- `border` defines all sides equally
- `outline`/`outline-width` defines all sides equally
- `overflow-clip-margin` defines all sides equally
- `columns` already flow-relative
- `gap` already flow-relative
- `animation-range` controlled by `*-timeline-axis`

## Keywords

Since keywords clearly establish physical/logical directions,
they would not be impacted by a global 'switch' --
but it's still useful to know
where logical functionality might be missing.

- `background-repeat` has `repeat-x` & `repeat-y` keywords
  - **missing** `repeat-inline` & `repeat-block`
- `background-position` has physical offset keywords
  - **missing** logical-side offsets
- `mask-repeat` has `repeat-x` & `repeat-y` keywords
  - **missing** `repeat-inline` & `repeat-block`
- `mask-position` has physical offset keywords
  - **missing** logical-side offsets
- `object-position` has physical offset keywords
  - **missing** logical-side offsets
- `offset-position` has physical offset keywords
  - **missing** logical-side offsets
- `perspective-origin` has physical offset keywords
  - **missing** logical-side offsets

No change needed…

- `caption-side` (`top` & `bottom`) are flow-relative,
  along with `inline-start` and `inline-end` alternatives
  to `left` and `right`
- `clear` has both logical & physical keywords
- `float` has both logical & physical keywords
- `flex-*` & `grid-*` already flow-relative
- `margin-trim` already flow-relative
- `scroll-snap-align` already flow-relative
- `scroll-snap-type` has both logical & physical keywords
- `scroll-timeline-axis` has both logical & physical keywords
- `place-*` and sub-properties, already flow-relative
- `position-area` already flow-relative
- `resize` has both logical & physical keywords
- `text-align` has both logical & physical keywords
- `text-align-last` has both logical & physical keywords
- `azimuth` logical dimensions have no meaning here

## Functions

- All `<basic-shape>` functions use **physical** dimensions
  - Impacts `clip-path`, `shape-outside`, `offset-path`
- `rotate()`, `translate()`, and `scale()`
  - Impacts `transform`
- various `gradient()` functions
  - Impacts all image properties

## SVG

Most SVG-related properties
such as `cx` and `cy` only provide physical syntax.
I imagine there might be use-cases
for SVG elements that adapt to writing mode,
but that seems like a separate concern.
