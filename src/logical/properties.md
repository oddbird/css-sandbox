---
title: Relevant CSS properties, keywords, and functions
draft: 2025-06-10
---

At this point,
I'm documenting everything that has
logical and/or physical syntax.
This is a very rough first pass,
and does not imply that every syntax
necessarily needs both options,
or that a logical-shorthand syntax
would need to impact all of these.

## Stand-alone properties

These accept either physical or logical dimensions,
but don't have associated sub-properties
for the individual dimensions involved.

- `aspect-ratio` **physical** (width / height)
- `background-size` **physical** (width & height)
- `border-spacing` logical (columns & rows)
- `border-image-outset` **physical** (trbl)
- `border-image-repeat` **physical** (tb & lr)
- `border-image-slice` **physical** (trbl)
- `border-image-width` **physical** (trbl)
- `box-shadow` **physical** (offset-x & -y)

No change needed…

- `column-width` & proposed `column-height` are flow-relative

## Shorthand properties

These shorthands accept dimensions,
which can be set individually using sub-properties.
Some of them have logical as well as physical
long-hand properties available,
while some are missing either the physical or logical alternative.

- `background-position` (`background-position-x` & `*-y`)
  - **missing**: `background-position-inline` & `*-block`
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

No change needed…

- `border` defines all sides equally
- `columns` already flow-relative
- `gap` already flow-relative

## Keywords

- `background-repeat` has `repeat-x` & `repeat-y` keywords
  - **missing** `repeat-inline` & `repeat-block`

No change needed…

- `caption-side` (`top` & `bottom`) are flow-relative
- `clear` has both logical & physical keywords
- `float` has both logical & physical keywords

## Functions

- All `<basic-shape>` functions use **physical** dimensions
  - Impacts `clip-path`

