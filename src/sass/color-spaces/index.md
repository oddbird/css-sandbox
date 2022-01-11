---
title: Sass Color Spaces
created: 2021-12-06
changes:
  - time: 2022-01-11T14:57:36-07:00
    log: More detail, with rough Sass suggestions
eleventyNavigation:
  key: sass-color-spaces
  title: Sass Color Spaces
  parent: sass
---

## Summary

Historically
CSS has been limited to a single color model (RGB)
and gamut (`sRGB`).
Authors have various formats to describe colors in that gamut --
using cubic hex notation `#rgb`/`#rrggbb`/`#rrggbbaa`
and functions `rgb()`/`rgba()`,
or cylindrical/polar-angle functions `hsl()`/`hwb()`.

Unfortunately, `sRGB` is a relatively narrow _color gamut_,
and RGB isn't a _perceptually uniform_ model.
Many monitors now support wider color gamuts
(such as the popular `display-p3`),
and there has also been significant progress
in developing more perceptually uniform color spaces
such as CIE `LAB`/`okLAB`.

The CSS Colors level 4 specification
describes how CSS authors can access these newer gamuts & formats --
with `okLAB` as the default space for color-mixing.
We want to provide support for this in Sass:
with server-side tools to manage colors across spaces,
and convert colors between spaces where appropriate.

## Goals and priorities

(These are initially based on the WCIG color API goals)

- Lossless color space conversion
  (e.g. LCH → P3)
  with optional gamut mapping.
- Color manipulation
  (e.g. making a color darker by reducing its LCH lightness)
  with choice of manipulation color space
- Color interpolation
  (e.g. mixing two colors, compositing, generating color scales)
  with choice of interpolation color space
- Difference between two colors (ΔE)
- Relative luminance of colors
  (WCAG 2.1, but able to adapt along with WCAG standards)

Ideally, these tools will be:

- Be learnable and usable,
  without deep understanding of color theory
  or verbose function calls
- Provides best-practice defaults
- Provides full control to color experts
- Be adaptable to future color spaces, formats,
  and algorithms (e.g. ΔE or relative luminance)

## Resources

- [Sass issue thread](https://github.com/sass/sass/issues/2831)
- [CSS Colors level 4](https://www.w3.org/TR/css-color-4/)
  ([Editor's Draft](https://drafts.csswg.org/css-color/))
- [WICG Color API repo](https://github.com/WICG/color-api)
  and ([Exploratory Draft](https://wicg.github.io/color-api/))
- [Previous Sass proposal](https://github.com/sass/sass/pull/2832),
  from March 2020
- [colorjs](https://colorjs.io/)

## Terms

The term _color space_ can be a bit fuzzy:

- A _color model_ is a way of describing colors
  and their relationships mathematically.
- A mapping function (or _color format_) provides access
  to a particular range (or _color gamut_) of colors in a given model.
- The combination of a color model and format
  can be visualized as a (generally 3D) _color space_,
  like a _cube_ or _cylinder_.
- Different _color formats_
  sometimes describe the same _color gamut_
  but with those colors mapped differently as a _color space_.
- Generally speaking,
  _polar angle_ functions describing a _cylindrical space_
  are the most intuitive for authors,
  and provide the best interpolation.

Sass currently:

- Supports a number of different formats,
  that all describe the same `sRGB` gamut.
- Handles all interpolation in cubic `RGB` space.
- Outputs the shortest possible format representing a given color,
  no matter what format was initially used to describe it.

The CIE color models act as a central standard
describing the full range of human-visible color.
Other color models are defined relative to this standard,
in order to make meaningful translation possible.

## Considerations

- Since existing formats have all worked within a single color-space,
  web authors are likely new to thinking about conversion across spaces.
- This will require providing extra clarity
  about the differences between
  color _formats_, _spaces_, and _gamuts_.
- Conversions between spaces are well-defined,
  but handling _out-of-gamut_ colors during conversion is
  much more situational and complicated.
- We want to provide tools that make it
  simple for authors to begin exploring colors outside `sRGB`,
  while also giving detailed control to more experienced authors.

The CIE-based `okLCH` format
currently provides the best experience for designers
in terms of:

- Describing the entire _gamut_ of human-visible color
  (so that it can encompass all other visual gamuts)
- Providing a _perceptually uniform_ distribution of those colors
  (so that movement around the space is predictable)
- Providing a _cylindrical_ space for color mixing/interpolation
  that provides the most 'expected' results

Those features are particularly helpful
for establishing automated design systems
based on color manipulation and relationships.

The downside is that such a wide-gamut format
easily allows authors to describe colors
that can't yet be displayed on any modern displays --
or colors that will display in some media and not others.
When translating colors from a wide gamut into a narrower gamut,
any _out-of-gamut_ colors will need to be mapped into the narrower space.

That added complexity also provides the advantage
of manipulating colors in a lossless format,
and reserving the details of gamut-mapping as an output concern --
or even leaving it up to the browser/display.

## Gamut mapping in CSS

Colors outside the gamut of a particular space
are still considered 'valid' as colors,
but have to be 'mapped' or adjusted to fit the space
before they can be displayed.

This should usually be done as late in the process as possible,
since it involves data-loss.
In most cases, that means we want to leave gamut-mapping
for the browser & device to resolve --
based on the color space of the display being used.
However, there might be some cases where
it becomes useful for web authors
to handle gamut-mapping manually in their Sass.

In CSS, it is _recommended_ that browsers handle 'gamut mapping'
with a 'relative colorimetric intent' --
basically 'clamping' colors to the edge of the gamut,
while maintaining hue as the primary concern.
The spec provides a
[pseudo-code algorithm](https://drafts.csswg.org/css-color/#binsearch)
for browsers to use when mapping
out-of-gamut colors for display.

It seems to me like Sass
should provide access to both
gamut-checking and gamut-mapping functions --
but we may want to plan ahead for
potential future improvements, if possible.
We will also need to consider carefully
when/if it is ever appropriate to automate gamut mapping internally.

Unfortunately,
Sass already does automated gamut-mapping of colors into the sRGB space
by clamping individual RGB channels --
which can cause dramatic hue-shift.
Any solution here needs to be backwards-compatible

## CSS color spaces & the `color()` function

The CSS specification allows for loading custom color spaces,
but there are also a number of provided spaces --
which should be the initial focus for Sass.

There are a number of RGB spaces/gamuts:

- [`sRGB`](https://drafts.csswg.org/css-color/#predefined-sRGB)
- [`sRGB-linear`](https://drafts.csswg.org/css-color/#predefined-sRGB-linear)
- [`display-p3`](https://drafts.csswg.org/css-color/#predefined-display-p3)
- [`a98-rgb`](https://drafts.csswg.org/css-color/#predefined-a98-rgb)
- [`prophoto-rgb`](https://drafts.csswg.org/css-color/#predefined-prophoto-rgb)
- [`rec2020`](https://drafts.csswg.org/css-color/#predefined-rec2020)

And a couple CIE XYZ spaces:

- [`xyz`/`xyz-d65`](https://drafts.csswg.org/css-color/#predefined-xyz)
- [`xyz-d50`](https://drafts.csswg.org/css-color/#predefined-xyz)

Each of these spaces can be accessed directly
using the `color()` function:

```
color( <color-space> <coordinates>{3} [ / <alpha> ]? )
```

==Has this changed with the introduction of `okLCH` et al?==

## Prior art

A number of other groups
are trying to solve the same issues.
Unfortunately, these are all interrelated
and updating at different intervals/pace.

### WICG color API (WIP)

==todo==

### colorjs (WIP)

Chris Lilly and Lea Verou
(both editors of the latest CSS color specs)
have developed [colorjs](https://colorjs.io/) --
a color manipulation tool in JS,
using many of the same algorithms that are provided in CSS.

That might be useful as a reference for implementation,
as well as a reference for use-cases and an author api.
That includes:

- accessing any channel of a color in a given format
- setting/adjusting any channel of a color in a given format
- accessing the current color-space of a color
- converting a color from one color space to another
- determining if a color is in-gamut for a given space
- mapping out-of-gamut colors into a given gamut/space
- interpolation between colors, in a given space/format
  (interpolating cartesian vs polar coordinates will have different results)
- determining the contrast between two colors

Currently, colorjs is
blurring the distinction between spaces and formats,
treating each format as a unique color space.
However, in conversations with Chris and Lea,
this seems to be an issue they are still struggling with
in relation to the proposed web color API.

## Possible Sass functionality

Sass currently blurs the lines
between different formats in the `sRGB` gamut,
performing interpolation on all of them
in cubic `RGB` space,
and generating output in the most concise format available.

So colors do not have a _format_
that authors can access or manipulate,
but they could have a _space_ and/or _gamut_.
This seems like the most difficult

### New Sass functions

Some new functions will be needed.
For example:

- `color.in-gamut($space, $color)`
  [boolean]
  Determine if a given color is in-gamut for a given color-space.
- `color.to-gamut($space, $color [, $mapping]?)`
  [color]
  Map the current color to the gamut of the given color space,
  or return the color unchanged if it is already in-gamut.
  In order to upgrade the mapping logic in the future,
  we might want some way to select the appropriate mapping algorithm.
- `color.space($color)` (or `color.format()`?)
  Return the current color space that a color is defined in
- `color.convert($space, $color, $mapping)`
  Convert a color from one space to another,
  with the option to do gamut-mapping for out-of-gamut colors.

### Existing Sass functions

Some existing functions
could get additional color-space functionality.
For example, both
`color.mix()` and `color.complement()`
could get an optional final parameter
for establishing the color space to mix in.

To follow the CSS approach,
the default space could be based on the colors provided,
such that:

- if all given colors are in the currently supported sRGB formats,
  default to using sRGB color math
- if new color formats outside sRGB are used,
  then okLCH is the default space for color math

Some existing functions
will need to be either updated
or duplicated for different formats.
For example,
`color.adjust`, `color.change`, and `color.scale`
all accept channel names --
but new formats will cause some of those names
(eg `hue` in `hsl` vs `lch`)
to have multiple meanings.
A similar issue exists with the color-channel functions
like `color.lightness` and `color.hue`.
