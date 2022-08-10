---
title: Sass Color Spaces Proposal
created: 2022-03-11
changes:
  - time: 2022-04-04T15:56:51-06:00
    log: Defining color terms, procedures, and functions
  - time: 2022-05-25T13:47:45-06:00
    log: |
      Define color parsing, missing/powerless components,
      and channel boundaries
  - time: 2022-06-01T13:35:32-06:00
    log: Define gamut-mapping, and allow spaces to represent gamuts
  - time: 2022-06-06T17:10:38-06:00
    log: |
      Improve parsing logic, and flesh out hwb() function
      based on [sample code](https://github.com/oddbird/sass-colors-sample)
  - time: 2022-06-28T17:34:49-06:00
    log: |
      Define hwb, (ok)lab, and (ok)lch functions,
      and update todo lists.
  - time: 2022-07-03T12:31:55-06:00
    log: Add support for color-spaces in color component parsing
  - time: 2022-07-08T18:13:39-06:00
    log: Parser support for color() syntax, and all new functions defined
  - time: 2022-08-09T17:10:33-06:00
    log: |
      - Finalize color interpolation logic, and `color.mix()` function
      - Note potential issues with missing (`none`) channels in conversion
      - Deprecate individual channel inspection functions in favor of
        `color.channel()`
      - Organize global and color-module function groups
      - Complete specification of global `hwb()` function,
        and deprecate `color.hwb()` functions
      - Specify updates to global `rgb()` functions
  - time: 2022-08-10T14:45:22-06:00
    log: |
      - Organize and document open issues
      - Define `hsl()`/`hsla()` functions
      - Remove any out-of-gamut channel clamping and adjustments
      - Ensure channels are returned as-specified when inspecting
eleventyNavigation:
  key: color spaces-proposal
  title: Color Spaces Proposal
  parent: sass
---

*([Issue](https://github.com/sass/sass/issues/2831))*

This proposal adds Sass support for several new CSS color spaces defined in
[CSS Color Level 4][color-4] -- including access to non-RGB color models and
colors outside the sRGB gamut.

[color-4]: https://www.w3.org/TR/css-color-4/

{% note %}
In order to test the logic of the following
procedures and functions,
we have started to implement
[sample code with tests](https://github.com/oddbird/sass-colors-sample).
{% endnote %}

{% warn %}
There is an open CSS issue around
[converting colors with missing channels](https://github.com/w3c/csswg-drafts/issues/7536),
which may force us to delay implementation
of the `none` keyword
in our initial release of color-spaces.
{% endwarn %}

## Table of Contents

{% note %}
See
[auto-generated TOC](#toc-details)
in header.
{% endnote %}

## Background

> This section is non-normative.

When working with color on the web, there are a few important terms:

- A *color model* is a mathematical approach to representing colors and their
  relationships. Historically, RGB has been the dominant color model for both
  computer monitors and web browsers. Lately, CIELab and OKLab models have
  shown significant benefits by providing a more *perceptually uniform*
  distribution of colors, so that similar mathematical adjustments achieve
  visually similar results.
- A *color space* is the result of projecting a color model into a coordinate
  system. In CSS, each color format describes a specific (and often unique)
  color space. For example, `rgb()` projects the RGB color model into a cubic coordinate system, and `hsl()` projects the same model into a cylindrical
  (polar-angle) space. Different spaces will have different benefits when
  adjusting or interpolating colors for different purposes.
- A *color gamut* is the full range of colors that can be described in a color
  space. Historically, all CSS spaces have been limited to the same sRGB gamut.
  However, modern computer monitors often support wider gamuts like display-p3.

### New CSS Color Spaces

The [CSS Color Level 4][color-4] specification defines a number of new color
spaces, each with its own syntax, but representing both new color models and
wider color gamuts.

CSS color manipulation & interpolation functions will use the OKLab color space
by default, unless otherwise defined for specific functions, or unless legacy
behavior needs to be maintained. The CIE model will act a central reference for
moving between spaces. Both models can be accessed in either cubic (LAB) or
cylindrical (LCH) space:

- `OKlab()` improves the perceptual uniformity of CIE LAB
- `OKlch()` improves the perceptual uniformity of CIE LCH
- (CIE) `lab()` is a cubic projection, using linear coordinates (like `rgb()`)
- (CIE) `lch()` is cylindrical, using polar angles for hue (like `hsl()`)

The new `color()` function provides access to a number of less common spaces.
The CIE XYZ spaces act as a central reference for conversion, with a gamut that
covers all human-visible colors.

- `color(<space> <x> <y> <z> / <a>)`:
  - `xyz-d50` (D50 reference white)
  - `xyz-d65` (D65 reference white)
  - `xyz` (Default D65 reference white)

The remaining spaces are all extensions of the RGB color model, providing
wider gamuts, improved bit-depth precision, or removed gamma-encoding:

- `color(sRGB <r> <g> <b> / <a>)` provides more bit depth precision when
  accessing the current sRGB gamut of colors.
- `color(sRGB-linear <r> <g> <b> / <a>)` provides the same sRGB gamut,
  without gamma-encoding (using a linear-light transfer function).
- `color(<space> <r> <g> <b> / <a>)` provides access to wider gamuts, such as:
  - `display-p3` (common on modern displays)
  - `a98-rgb`
  - `prophoto-rgb`
  - `rec2020`

Since the `display-p3` color space represents a common space for wide-gamut
monitors, that is likely to be one of the more popular color spaces for authors
who simply want access to a wider range of colors -- and don't require the
improved uniformity of manipulation or ease-of-use provided by CIE & OK spaces.
The `sRGB` syntax is also useful as a way to 'opt out' of legacy color handling
for RGB colors.

### Missing & Powerless Color Components

[CSS Color Level 4][color-4] also adds support for 'missing' & 'powerless'
color components. For example, when converting a grayscale color to a
polar-angle space like `hsl`, the resulting `hue` is unknown. Similarly, at the
extremes of `lightness` (eg `black` or `white`), both `hue` and `saturation`
become 'powerless' -- changing them has no impact.

This can now be represented in CSS & Sass by using a value of `none`, so that
the color `white` becomes effectively `hsl(none none 100%)`. The `none` value
is treated as `0` in most cases, but when interpolating two colors, a `none`
value takes it's value from the other color involved.

This also allows interpolating specific channels of a color. For example,
any color can be moved towards 'grayscale' by mixing it with the color
`oklch(none 0% none)`.

### Color Conversion and Gamut Mapping

The [CSS Color Level 4][color-4] specification defines algorithms for
conversion between all the new and existing color spaces. Still, since some
spaces provide access to wider gamuts than others, it is possible for a
color defined or manipulated in one color space to be 'out-of-gamut' when
converted to another space.

There are various possible ways to 'map' an out-of-gamut color to its nearest
in-gamut relative, and the spec provides some advice on how that can be done.
In order to avoid data-loss, it's often best to leave gamut-mapping as a detail
for the browser to manage, based on the gamut of the display. Still, it would
be good for Sass to provide some explicit gamut-mapping tools for authors to
use when converting newer color-systems into backwards-compatible output.

The primary approach is to reduce the `chroma` value of a color in `OKlch`
space, until it is reasonably 'close', and then clamping channel values in the
destination color space. Chroma reduction helps avoid more noticeable shifts in
`lightness` and `hue`, while the final clamping helps avoid dramatic `chroma`
shifts when a more subtle movement is possible.

### Browser Support

WebKit/Safari is already shipping support for all these new color spaces,
and Gecko/Firefox has released some early drafts behind an experimental flag.
These features are also included as a goal of [Interop 2022][interop], which
makes them likely to roll out in all browsers by the end of the year.

## Summary

> This section is non-normative.

This proposal defines global (un-prefixed) Sass support for all of the
color functions in [CSS Color Level 4][color-4] (`hwb()`, `lab()`/`lch()`,
`oklab()`/`oklch()`, `color()`). All (new and existing) color functions are
also extended to support both:

- An awareness of multiple color spaces and gamuts where appropriate
- `none` values (explicitly set, or generated during conversion/interpolation)

Additionally, this proposal provides new functions in the sass color module
for inspecting a color's space, as well as converting & gamut-mapping across
different spaces.

### Design Decisions

Because all previously-available CSS color spaces provided the same gamut of
colors using the same color model, both CSS & Sass have considered them
interchangeable, converting between them silently, and using RGB/a internally.
In order to move forward while maintaining backwards compatibility, both CSS
& Sass will need to maintain some legacy handling for these legacy colors,
while providing a way to opt into the new defaults used by newer color syntax.

The proposed solution in CSS is that:
- Legacy colors in legacy functions continue to use `srgb` space
- If new color syntax is involved, the default interpolation space is `oklch`
- Individual functions can override the default, if a different space is better
  suited to the specific task
- Individual functions can also provide authors with a syntax to select the
  interpolation space explicitly

CSS serialization converts all hex, rgb(a), hsl(a), hwb, and named colors
to their rgb(a) equivalent, as part of a shared `srgb` space. However:

- `hsl` and `hwb` remain distinct spaces for interpolation functions to use.
- the `color(srgb …)` syntax is also part of `srgb` space, but has higher bit
  depth, and opts out of legacy interpolation behavior.

We have attempted to match this behavior.

## Definitions

### Color

> Note that channel values are stored as specified, maintaining precision where
> possible, even when the values are out-of-gamut for the given [color space][].

A *color* is an object with several parts:

* A string [*color space*](#color-space)

* An ordered list of *channel* values as defined by that [color space][].

* A numeric *alpha* value which can be safely clamped in the `0-1` or `0%-100%`
  range. Values outside that range are allowed, but meaningless.

* A boolean *is-legacy* to indicate a [legacy color][].

[legacy color]: #legacy-color
[color space]: #color-space

### Legacy Color

> Both Sass and CSS have similar legacy behavior that relies on all colors
> being interchangeable as part of a shared `srgb` color space. While the new
> color formats will opt users into new default behavior, some legacy color
> formats behave differently for the sake of backwards-compatibility.

Colors that are defined using the CSS color names, hex syntax, `rgb()`,
`rgba()`, `hsl()`, `hsla()`, or `hwb()` -- along with colors that result from
legacy interpolation -- are considered *legacy colors*. All legacy colors use
the `srgb` color space, with `red`, `green`, and `blue` channels. The output of
a [legacy color][] is not required to match the input syntax.

### Color Space

Every color is stored internally as part of a defined color space. Each space
has a name, and an ordered list of associated channels that can be accessed and
manipulated in that space. Each channel value can be any number, or the keyword
`none`.

_Bounded_ channels have a clearly-defined range that can be mapped to
percentage values and scaled, even if those channels are not clamped to the
range given.

> This follows the CSS specification, which defines percentage-mapping onto
> several channels that are technically unbounded. However, some channels
> (marked below) are percentage-mapped without a clear boundary for scaling.

The color spaces and their channels are:

* `rgb` (RGB):
  * `red` (bounded [0,1] or [0,255], depending on host syntax)
  * `green` (bounded [0,1] or [0,255], depending on host syntax)
  * `blue` (bounded [0,1] or [0,255], depending on host syntax)
* `hwb` (RGB):
  * `hue` (polar angle)
  * `whiteness` (bounded percentage)
  * `blackness` (bounded percentage)
* `hsl` (RGB):
  * `hue` (polar angle)
  * `saturation` (bounded percentage)
  * `lightness` (bounded percentage)
* `srgb` (RGB):
  * `red` (bounded [0,1])
  * `green` (bounded [0,1])
  * `blue` (bounded [0,1])
* `srgb-linear` (RGB):
  1. `red` (bounded [0,1])
  2. `green` (bounded [0,1])
  3. `blue` (bounded [0,1])
* `display-p3` (RGB):
  1. `red` (bounded [0,1])
  2. `green` (bounded [0,1])
  3. `blue` (bounded [0,1])
* `a98-rgb` (RGB):
  1. `red` (bounded [0,1])
  2. `green` (bounded [0,1])
  3. `blue` (bounded [0,1])
* `prophoto-rgb` (RGB):
  1. `red` (bounded [0,1])
  2. `green` (bounded [0,1])
  3. `blue` (bounded [0,1])
* `rec2020` (RGB):
  1. `red` (bounded [0,1])
  2. `green` (bounded [0,1])
  3. `blue` (bounded [0,1])
* `xyz`:
  1. `x` (percentage-mapped `0% = 0.0, 100% = 1.0`)
  2. `y` (percentage-mapped `0% = 0.0, 100% = 1.0`)
  3. `z` (percentage-mapped `0% = 0.0, 100% = 1.0`)
* `xyz-d50`:
  1. `x` (percentage-mapped `0% = 0.0, 100% = 1.0`)
  2. `y` (percentage-mapped `0% = 0.0, 100% = 1.0`)
  3. `z` (percentage-mapped `0% = 0.0, 100% = 1.0`)
* `xyz-d65`:
  1. `x` (percentage-mapped `0% = 0.0, 100% = 1.0`)
  2. `y` (percentage-mapped `0% = 0.0, 100% = 1.0`)
  3. `z` (percentage-mapped `0% = 0.0, 100% = 1.0`)
* `lab`:
  1. `lightness` (percentage-mapped `0% = 0.0, 100% = 100.0`)
  2. `a` (percentage-mapped `-100% == -125, 100% == 125`)
  3. `b` (percentage-mapped `-100% == -125, 100% == 125`)
* `lch`:
  1. `lightness` (percentage-mapped `0% = 0.0, 100% = 100.0`)
  2. `chroma` (percentage-mapped `0% = 0, 100% = 150`)
  3. `hue` (polar angle)
* `oklab`:
  1. `lightness` (percentage-mapped `0% = 0.0, 100% = 1.0`)
  2. `a` (percentage-mapped `-100% = -0.4, 100% = 0.4`)
  3. `b` (percentage-mapped `-100% = -0.4, 100% = 0.4`)
* `oklch`:
  1. `lightness` (percentage-mapped `0% = 0.0, 100% = 1.0`)
  2. `chroma` (percentage-mapped `0% = 0.0, 100% = 0.4`)
  3. `hue` (polar angle)

### Predefined Color Spaces

> 'Predefined color spaces' can be described using the `color()` function.

The _predefined RGB spaces_ are:

* `srgb`
* `srgb-linear`
* `display-p3`
* `a98-rgb`
* `prophoto-rgb`
* `rec2020`

The _predefined XYZ spaces_ are:

* `xyz`
* `xyz-d50`
* `xyz-d65`

### Missing Components

In some cases, a color can have one or more missing components (channel or
alpha values). Missing components are represented by the keyword `none`. When
interpolating between colors, the missing component is replaced by the value
of that same component in the other color. In all other cases, the missing
value is treated as `0`.

{% warn %}
This feature is at-risk,
pending the resolution of a CSS specification issue.
See https://github.com/w3c/csswg-drafts/issues/7536
{% endwarn %}

### Powerless Components

In some color spaces, it is possible for a channel value to become 'powerless'
in certain circumstances. If a powerless channel value is produced as the
result of color-space conversion, then that value is considered to be
[missing][], and is replaced by the keyword `none`.

[missing]: #missing-components

* `hsl`:

  * If the `saturation` value is `0%`, then the `hue` channel is powerless.

  * If the `lightness` value is either `0%` or `100%`, then both the `hue` and
    `saturation` values are powerless.

* `hwb`:

  * If the combined `whiteness` and `blackness` values (after normalization)
    are equal to `100%`, then the `hue` channel is powerless.

* `lab`/`oklab`:

  * If the `lightness` value is `0%`, then both the `a` and `b` channels are
    powerless.

  > The current spec has an inline issue asking if high values of
  > `lightness` (whites) should make the `a` and `b` values powerless:
  > See: https://drafts.csswg.org/css-color-4/#issue-e05ac5c3

* `lch`/`oklch`:

  * If the `chroma` value is 0%, then the `hue` channel is powerless.

  * If the `lightness` value is `0%`, then both the `hue` and `chroma` channels
    are powerless.

  > The current spec has an inline issue asking if high values of
  > `lightness` (whites) should make the `hue` and `chroma` values powerless.
  > See: https://drafts.csswg.org/css-color-4/#issue-1813c844

### Color Gamuts

A _color gamut_ is a range of colors that can be displayed by a given device,
or described in a given color space. The predefined RGB gamuts are:

* `srgb`
* `display-p3`
* `a98-rgb`
* `prophoto-rgb`
* `rec2020`

There are several additional color spaces that are associated with the
`srgb` gamut:

* `rgb`
* `srgb-linear`
* `hwb`
* `hsl`

All other color spaces describe unknown or theoretically infinite gamuts.

### Color Interpolation Method

```
<x><pre>
**ColorInterpolationMethod** ::= 'in' (
&#32;                                 RectangularColorSpace
&#32;                               | PolarColorSpace HueInterpolationMethod?
&#32;                             )
**RectangularColorSpace**    ::= 'srgb'
&#32;                          | 'srgb-linear'
&#32;                          | 'lab'
&#32;                          | 'oklab'
&#32;                          | 'xyz'
&#32;                          | 'xyz-d50'
&#32;                          | 'xyz-d65'
**PolarColorSpace**          ::= 'hsl'
&#32;                          | 'hwb'
&#32;                          | 'lch'
&#32;                          | 'oklch'
**HueInterpolationMethod**   ::= (
&#32;                                'shorter'
&#32;                              | 'longer'
&#32;                              | 'increasing'
&#32;                              | 'decreasing'
&#32;                              | 'specified'
&#32;                            ) 'hue'
</pre></x>
```

> Different color interpolation methods provide different advantages. For that
> reason, individual color procedures and functions (the host syntax) can
> establish their own color interpolation defaults, or provide a syntax for
> authors to explicitly choose the method that best fits their need.

The **host syntax** for a given interpolation procedure is the color syntax
or function that instigates that interpolation. When selecting a color
interpolation method:

* If the host syntax defines what method to use use, use the specified method.

* Otherwise, if all the colors involved are [legacy colors](#legacy-color),
  use `srgb`.

* Otherwise, use `oklab`.

## Procedures

### Converting a Color

Colors can be converted from one [color space][] to another. Algorithms for
color conversion are defined in the [CSS Color Level 4][color-4]
specification. Each algorithm takes a color `origin-color`, and a string
`target-space`, and returns a color `output-color`.

{% warn %}
There's an open issue about
how to properly handle `none` values while
converting a color.
See https://github.com/w3c/csswg-drafts/issues/7536
{% endwarn %}

[color-space]: #color-space

The algorithms are:

* [HSL to sRGB](https://www.w3.org/TR/css-color-4/#hsl-to-rgb)

* [sRGB to HSL](https://www.w3.org/TR/css-color-4/#rgb-to-hsl)

* [HWB to sRGB](https://www.w3.org/TR/css-color-4/#hwb-to-rgb)

* [sRGB to HWB](https://www.w3.org/TR/css-color-4/#rgb-to-hwb)

* [Lab to LCH, OKLab to OKLCH](https://www.w3.org/TR/css-color-4/#lab-to-lch)

* [LCH to Lab, OKLCH to OKLab](https://www.w3.org/TR/css-color-4/#lch-to-lab)

* [Between predefined RGB spaces](https://www.w3.org/TR/css-color-4/#predefined-to-predefined)

* [Any RGB to Lab/OKLab](https://www.w3.org/TR/css-color-4/#predefined-to-lab-oklab)

* [Lab/OKLab to any RGB](https://www.w3.org/TR/css-color-4/#oklab-lab-to-predefined)

> For additional details, see the [Sample code for color conversions][convert].

[convert]: https://www.w3.org/TR/css-color-4/#color-conversion-code

### Gamut Mapping

> Some [color spaces](#color-space) describe limited
> [color gamuts](#color-gamuts). If a color is 'out of gamut' for a particular
> space (most often because of conversion from a larger-gamut color-space), it
> can be useful to 'map' that color to the nearest available 'in-gamut' color.
> Gamut mapping is the process of finding an in-gamut color with the least
> objectionable change in visual appearance.

Gamut mapping in Sass follows the [CSS gamut mapping algorithm][css-mapping].
This procedure accepts a color `origin` in the color space `origin color space`,
and a destination color space `destination`. It returns the result of a
[CSS gamut map](css-map) procedure, which is a color in the `destination` color
space.

> This algorithm implements a relative colorimetric intent, and colors inside
> the destination gamut are unchanged.

[css-mapping]: https://drafts.csswg.org/css-color/#css-gamut-mapping-algorithm
[css-map]: https://drafts.csswg.org/css-color/#css-gamut-map

### Parsing Color Components

This procedure accepts an `input` parameter to parse, along with a `space`
parameter representing the [color space][], if known. It throws common parse
errors if necessary, and returns either `null` (if the `input` contains special
CSS values), or a list of parsed values. The return value is in the format
`<color-space>? (<channel>+) / <alpha>`, where the color space is included in
the return value if it was not passed in initially.

> This supports both the known color formats like `hsl()` and `rgb()`, where
> the space is determined by the function, as well as the syntax of `color()`,
> where the space is included as one of the input arguments (and may be a
> user-defined space).

The procedure is:

  * If `input` is a [special variable string][], return `null`.

  * Let `include-space` be true if `space` is undefined, and false otherwise.

  * If `input` is a bracketed list, or a list with a separator other than
    'slash' or 'space', throw an error.

  * If `input` is a slash-separated list:

    * If `input` doesn't have exactly two elements, throw an error.

    * Otherwise, let `components` be the first element and `alpha` the second
      element of `input`.

  * Otherwise:

    * Let `components` be an unbracketed space separated list of all except the
      last element of `input`.

    * If the last element of `input` is an unquoted string that contains `/`:

      * Let `split-last` be the result calling `string.split()` with the last
        element of `input` as the string to split, and `/` as the separator.

      * If there are not two items in `split-last`, throw an error.

      * If either item in `split-last` can be coerced to a number, replace the
        current value of the item with the resulting number value.

      * Let `alpha` be the second element in `split-last`, and append the first
        element of `split-last` to `components`.

      > This solves for a legacy handling of `/` in Sass that would produce an
      > unquoted string when the alpha value is a css function such as `var()`
      > or when either value is the keyword `none`.

    * Otherwise, if the last element of `input` has preserved its status as two
      slash-separated numbers:

      * Let `alpha` be the number after the slash, and append the number before
        the slash to `components`.

    * Otherwise, append the last element of `input` to `components`

  * If `components` is undefined or an empty list, throw an error.

  * If `components` is a [special variable string][]:

    * Let `channels` be the value of `components`.

  * Otherwise:

    * If `components` is not an unbracketed space-separated list, throw an error.

    * If `space` is undefined, let `space` be the first element in `components`,
      and let `channels` be an unbracketed space-separated list with the
      remaining elements from `components`.

    * Otherwise, let `channels` be the value of `components`.

    * If `space` is not a string, throw an error.

    * Let `expected` be the number of channels in `space` if `space` is a known
      [color-space][], and null otherwise.

    * If `expected` is not null, and `channels` has more than `expected`
      elements, throw an error.

    * If any element of channels is not either a number, a special variable
      string, a special number string, or the keyword `none`, throw an error.

  * If `alpha` is undefined, let `alpha` be `1`.

  * Otherwise, If `alpha` is not a [special number string][]:

    * If `alpha` is a number, set `alpha` to the result of
      [percent-converting][] `alpha` with a max of 1.

    * Otherwise, throw an error.

  * If `space` or `channels` is a [special variable string][], or if `alpha` is
    a [special number string][], or if `space` is not a known [color space][],
    return `null`.

    > Unknown color spaces are valid in CSS, but should not be treated as
    > color objects for the sake of Sass manipulation.

  * If any element of `channels` is a [special number string][], return `null`.

    > Doing this late in the process allows us to throw any obvious syntax
    > errors, even for colors that can't be fully resolved on the server.

  * If `expected` is not null, and the length of `channels` is not equal to
    `expected`, throw an error.

    > Once special values have been handled, any colors remaining should have
    > exactly the expected number of channels.

  * If `include-space` is true, let `parsed` be an unbracketed space-separated
    list with `space` as the first element, and `channels` as the second.

  * Otherwise, let `parsed` be the value of `channels`.

  * Return an unbracketed slash-separated list with `parsed` as the first
    element, and `alpha` as the second.

    > This results in valid CSS color-value output, while also grouping
    > space, channels, and alpha as separate elements in nested lists.
    > Alternately, we could allow `parsed` to be a single flat list, even
    > when the color-space is included?

[special variable string]: ../spec/functions.md#special-variable-string
[special number string]: ../spec/functions.md#special-number-string
[percent-converting]: #percent-converting-a-number

### Normalizing Hue

This process accepts a `hue` angle, and boolean `convert-none` arguments. It
returns the hue normalized to degrees when possible, and converting `none` to
`0` when requested. Otherwise it throws an error for invalid `hue`.

* If the value of `hue` is `none`:

  * If `convert-none` is `true`, return `0`.

  * Otherwise, return `hue` without changes.

* Return the result of converting `hue` to `deg` allowing unitless.

> Normalizing the result into a half-open range of `[0,360)` would be a lossy
> transformation, since some forms of [hue interpolation][hue-method] require
> the specified hue values.

### Interpolating Colors

This procedure accepts two color arguments (`color1` and `color2`), an
optional [color interpolation method][] `method`, and a percentage `weight`
for `color1` in the mix. It returns a new color `mix` that represents the
appropriate mix of input colors.

* If either `color1` or `color2` is not a color, throw an error.

* If `weight` is undefined, set `weight` to `50%`.

* If `weight` doesn't have unit `%` or isn't between `0%` and `100%`
  (inclusive), throw an error.

* If `method` is undefined:

  * Let `interpolation-space` be `srgb` if `is-legacy`, and `oklab` otherwise.

    > This default behavior is defined in [CSS Color Level 4][color-4].

* Otherwise:

  * If `method` is not a [color interpolation method][color-method], throw an
    error.

  * Let `interpolation-space` be the [color space][] specified in `method`.

  * If `interpolation-space` is a [PolarColorSpace][color-method]:

    * Let `interpolation-arc` be the `HueInterpolationMethod` specified in
      `method`, or `shorter` if no hue interpolation is specified.

* For each `color` of `color1` and `color2`:

  * Set `color` to the results of [converting][] `color` into
    `interpolation-space`.

  * If any `component` of `color` is `none`, set that `component` to the value
    of the corresponding component in the other color.

    > If both values are `none`, the interpolation result for that component
    > will also be `none`.

  * Set `color` to the result of [premultiplying] `color`.

* Let `mix` be a new color in the `interpolation-space` [color space][],
  with `none` for alpha and all channel values.

  * For each `channel` of `mix`:

    * Let `channel1` and `channel2` be the corresponding channel values in
      `color11` and `color2` respectively.

    * If `channel` represents a hue angle, set `channel1` and `channel2`
      respectively to the results of [hue interpolation][hue-method] with
      `channel1` as `hue1`, `channel2` as `hue2`, using the `interpolation-arc`
      method.

    * Set `channel` to the result of calculating
      `(channel1 * weight1) + (channel2 * weight2)`.

    * If `is-legacy`, set `channel` to the result of rounding `channel`.

* Return the color `mix`.

[premultiplying]: #premultiply-transparent-colors
[un-premultiplying]: #premultiply-transparent-colors
[color-method]: #color-interpolation-method
[hue-method]: #hue-interpolation
[converting]: #converting-a-color

#### Premultiply Transparent Colors

When the colors being interpolated are not fully opaque, they are transformed
into premultiplied color values. This process accepts a single `color` and
updates the channel values if necessary, returning a new color with
premultiplied channels.

* If the `color` has an `alpha` value of 1, return `color` unchanged.

* Otherwise, for each `channel` in `color`:

  * If either the `alpha` value, or the `channel` value is `none`, or the
    `channel` represents a polar-angle `hue`, keep the original value of
    `channel`.

  * Otherwise, set `channel` to the result of multiplying the `channel` value
    by the `alpha` value.

* Return the resulting `color` with premultiplied channels.

The same process can be run in reverse, to **un-premultiply** the channels of a
given `color`:

* If the `color` has an `alpha` value of 1, return `color` unchanged.

* Otherwise, for each `channel` in `color`:

  * If either the `alpha` value, or the `channel` value is 0 or `none`, or the
    `channel` represents a polar-angle `hue`, keep the original value of
    `channel`.

  * Otherwise, set `channel` to the result of dividing the premultiplied
    `channel` value by the `alpha` value.

* Return the resulting `color` with un-premultiplied channels.

#### Hue Interpolation

> When interpolating between polar-angle hue channels, there are multiple
> 'directions' the interpolation could move, following different logical rules.

This process accepts two hue angles (`hue1` and `hue2`), and returns both hues
adjusted according to the given `method`. When no hue interpolation `method` is
specified, the default is `shorter`.

The process for each [hue interpolation method][hue-interpolation] is defined
in [CSS Color Level 4][color-4]. Unless the `menthod` is the value `specified`,
both angles need to be constrained to `[0, 360)` prior to interpolation.

* [shorter](https://www.w3.org/TR/css-color-4/#shorter)

* [longer](https://www.w3.org/TR/css-color-4/#hue-longer)

* [increasing](https://www.w3.org/TR/css-color-4/#increasing)

* [decreasing](https://www.w3.org/TR/css-color-4/#decreasing)

* [specified](https://www.w3.org/TR/css-color-4/#hue-specified)

[hue-interpolation]: https://www.w3.org/TR/css-color-4/#hue-interpolation

## Deprecated Functions

Individual color-channel functions defined globally or in the color module are
deprecated in favor of the new `color.channel()` function. That includes:

* `color.red()`/`red()`
* `color.green()`/`green()`
* `color.blue()`/`blue()`
* `color.hue()`/`hue()`
* `color.saturation()`/`saturation()`
* `color.lightness()`/`lightness()`
* `color.whiteness()`
* `color.blackness()`

While deprecated, if the specified color argument is not a [legacy color][],
throw an error.

## New Color Module Functions

These new functions are part of the built-in `sass:color` module.

### `color.space()`

* ```
  space($color)
  ```

  * If `$color` is not a color, throw an error.

  * Return a quoted string with the name of `$color`s associated
    [color space][].

### `color.to-space()`

* ```
  to-space($color, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `origin-space` be the result of calling `space($color)`.

  * If `origin-space` equals-equals `$space`, return `$color`.

    > This allows unknown spaces, as long as they match the origin space.

  * If `$space` is not a [color space][], throw an error.

  * Return the result of [converting][] the `origin-color`
    `$color` to the `target-space` `$space`.

### `color.is-legacy()`

* ```
  is-legacy($color)
  ```

  * If `$color` is not a color, throw an error.

  * Return `true` if `$color` is a [legacy color][], or `false`
    otherwise.

### `color.is-powerless()`

* ```
  is-powerless($color, $channel, $space)
  ```

  * If `$color` is not a valid color, throw an error.

  * If `$space` is null:

    * Let `color` be the value of `color`, and let `space` be the result of
      calling `space($color)`.

  * Otherwise:

    * Let `color` be the result of calling `to-space($color, $space)`, and let
      `space` be the value of `$space`.

  * If `$channel` is not the name of a channel in the color-space `space`,
    throw an error.

  * Return `true` if the channel `$channel` is [powerless](#powerless-components)
    in `color`, otherwise return `false`.

### `color.is-in-gamut()`

* ```
  is-in-gamut($color, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `space` be the value of `$space` if specified, or the result of calling
    `space($color)` otherwise.

  * If `space` is not a valid [color space][], throw an error.

  * Let `gamut` be the [color gamut](#color-gamuts) associated with `space`
    if an association is defined, or the value of `space` otherwise.

  * Let `color` be the result of calling `to-space($color, space)`.

  * For all bounded channels in `space`, if the associated channel value in
    `$color` is outside the bounded range, return `false`.

  * Otherwise, return `true`.

### `color.to-gamut()`

* ```
  to-gamut($color, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `origin-space` be the result of calling `space($color)` otherwise.

  * Let `target-space` be the value of `$space` if specified, or the value of
    `origin-space` otherwise.

  * If `target-space` is not a valid [color space][], throw an error.

  * Return the result of [gamut mapping](#gamut-mapping) with `$color` as the
    `origin` color, `origin-space` as the `origin color space`, and
    `target-space` as the `destination` color space.

### `color.channel()`

> Note that channel values are stored as specified, even if those values are
> out-of-gamut for the [color space][] used. Similarly, this color-channel
> inspection function may return out-of-gamut channel values.

* ```
  channel($color, $channel, $space)
  ```

  * If `$space` is null:

    * Let `space` be the result of calling `space($color)`, and let `color` be
      the value of `$color`.

  * Otherwise:

    * Let `color` be the result of calling `to-space($color, $space)`, and let
      `space` be the value of `$space`.

  * If `space` is a known [color space][], let `channels` be a map of channel
    names defined for `space`, and their corresponding values in `color`, or a
    map with 1-indexed number keys and their corresponding values in `color`
    otherwise.

  * Let `value` be the result of calling `map.get(channels, $channel)`.

  * If `value` is `null`, throw an error.

  * Otherwise, return `value`.

## Modified Color Module Functions

### `color.hwb()`

These functions are now deprecated. Authors should use global `hwb()` instead.

> Channel clamping and scaling have been removed from the global function,
> since we now allow out-of-gamut color-channels to be stored as specified.

* ```
  hwb($channels)
  ```

  This function is available as a global function named `hwb()`.

* ```
  hwb($hue, $whiteness, $blackness, $alpha: 1)
  ```

  * Return the result of calling the global function
    `hwb($hue $whiteness $blackness / $alpha)`.

### `color.mix()`

```
mix($color1, $color2,
  $weight: 50%, $method: null)
```

  * Return the result [interpolating](#interpolating-colors) between `$color1`
    and `$color2` with the specified `$weight` and `$method`.

### ToDo

{% note 'ToDo' %}
- `adjust()`
- `change()`
- `scale()` (any channel with clear boundaries)
- `complement()` (perform hue adjustment in the proper space)
- `invert()` (perform inversion in the proper space)
- `grayscale()` (perform inversion in the proper space)
- `alpha()`
- `ie-hex-str()`? DEPRECATE, meantime gamut-map.

For manipulating `none` (missing) channels:

- `change()` overrides
- `adjust()`/`scale()` throw errors (or assume 0???)
- `channel()` returns `none`
{% endnote %}

## New Global Functions

These new CSS functions are provided globally.

### `hwb()`

* ```
  hwb($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` with an `hwb` space.

  * If `components` is null, return a plain CSS function string with the name
    `"hwb"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `hue`, `whiteness`, and `blackness` be the three elements of `channels`.

  * Set `hue` to the result of [normalizing](#normalizing-hue) `hue` with
    `convert-none` set to `false`.

  * For either of `whiteness` and `blackness` doesn't have unit `%`, throw an
    error.

    > Channel clamping and scaling have been removed, since we now allow
    > out-of-gamut color-channels to be stored as specified.

  * Return a [legacy color][] in the `hwb` space, with the given `hue`,
    `whiteness`, and `blackness` channels, and `alpha` value.

[parsing]: #parsing-color-components

### `lab()`

* ```
  lab($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` in an `lab` space.

  * If `components` is null, return a plain CSS function string with the name
    `"lab"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `lightness`, `a`, and `b` be the three elements of `channels`.

  * If any of `lightness`, `a`, or `b` is a number with a unit other than `%`,
    throw an error.

  * If `lightness` is a number less than `0`, set `lightness` to `0%`.

  * Return a color in the `lab` [color space][], with the given `lightness`,
    `a`, and `b` channels, and `alpha` value.

### `lch()`

* ```
  lch($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` in an `lch` space.

  * If `components` is null, return a plain CSS function string with the name
    `"lab"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `lightness`, `chroma`, and `hue` be the three elements of `channels`.

  * If `chroma` or `lightness` is a number with a unit other than `%`, throw an
    error.

  * For each `channel` in `chroma` and `lightness`, if `channel` is a number
    less than `0`, set `channel` to `0%`.

  * Set `hue` to the result of [normalizing](#normalizing-hue) `hue` with
    `convert-none` set to `false`.

  * Return a color in the `lch` [color space][], with the given `lightness`,
    `chroma`, and `hue` channels, and `alpha` value.

### `oklab()`

* ```
  oklab($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` in an `oklab` space.

  * If `components` is null, return a plain CSS function string with the name
    `"lab"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `lightness`, `a`, and `b` be the three elements of `channels`.

  * If any of `lightness`, `a`, or `b` is a number with a unit other than `%`,
    throw an error.

  * If `lightness` is a number less than `0`, set `lightness` to `0%`.

  * Return a color in the `oklab` [color space][], with the given `lightness`,
    `a`, and `b` channels, and `alpha` value.

### `oklch()`

* ```
  oklch($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` in an `oklch` space.

  * If `components` is null, return a plain CSS function string with the name
    `"lab"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `lightness`, `chroma`, and `hue` be the three elements of `channels`.

  * If `chroma` or `lightness` is a number with a unit other than `%`, throw an
    error.

  * For each `channel` in `chroma` and `lightness`, if `channel` is a number
    less than `0`, set `channel` to `0%`.

  * Set `hue` to the result of [normalizing](#normalizing-hue) `hue` with
    `convert-none` set to `false`.

  * Return a color in the `oklch` [color space][], with the given `lightness`,
    `chroma`, and `hue` channels, and `alpha` value.

### `color()`

* ```
  color($description)
  ```

  * Let `components` be the result of [parsing] `$description` with
    undefined space.

  * If `components` is null, return a plain CSS function string with the name
    `"color"` and the argument `$description`.

  * Let `color` be the first element and `alpha` the second element of
    `components`.

  * Let `space` be the first element and `channels` the second element of
    `color`.

  * If `space` is not a [predefined color space][predefined], throw an error,.

    > Custom spaces have already been output as CSS functions.

  * For each `channel` element of `channels`, if `channel` is a number:

    * If `channel` has a unit other than `%`, throw an error.

    * If `channel` is a percentage, set `channel` to the result of
      `channel / 100%`.

    > Channels are not clamped, since out-of-gamut values are allowed

  * Return a color in the `space` [color space][], with the given `channels`
    and `alpha` value.

[predefined]: #predefined-color-spaces

## Modified Global Functions

Any legacy global functions that are not explicitly updated here should continue
to behave as alias functions for their appropriately updated counterparts.

> Note that the new logic preserves decimal values in color channels, as well
> as preserving the initial color-space used in defining a color.

### `rgb()` and `rgba()`

The `rgba()` function is identical to `rgb()`, except that if it would return a
plain CSS function named `"rgb"` that function is named `"rgba"` instead.

* ```
  rgb($red, $green, $blue, $alpha: 1)
  ```

  * If any argument is a [special number][], return a plain CSS function
    string with the name `"rgb"` and the arguments `$red`, `$green`, `$blue`,
    and `$alpha`.

  * If any of `$red`, `$green`, `$blue`, or `$alpha` aren't numbers or the
    keyword `none`, throw an error.

  * Let `red`, `green`, and `blue` be the result of [percent-converting][]
    `$red`, `$green`, and `$blue`, respectively, with a `max` of 255.

  * Let `alpha` be the result of percent-converting `$alpha` with a `max` of 1.

  * Return a [legacy color][] in the `rgb` space, with the given `red`,
    `green`, and `blue` channels, and `alpha` value.

* ```
  rgb($red, $green, $blue)
  ```

  * If any argument is a [special number][], return a plain CSS function string
    with the name `"rgb"` and the arguments `$red`, `$green`, and `$blue`.

  * Otherwise, return the result of calling `rgb()` with `$red`, `$green`,
    `$blue`, and `1`.

* ```
  rgb($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` with an `rgb` space.

  * If `components` is null, return a plain CSS function string with the name
    `"rgb"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `red`, `green`, and `blue` be the three elements of `channels`.

  * Return the result of calling `rgb()` with `red`, `green`, `blue`, and
    `alpha` as arguments.

* ```
  rgb($color, $alpha)
  ```

  * If either argument is a [special variable string][], return a plain CSS
    function string with the name `"rgb"` and the same arguments.

  * If `$color` is not a [legacy color][], throw an error.

  * Return the result of calling `rgb()` with `$color`'s red, green, and blue
    channels as unitless number arguments, and `$alpha` as the final argument.

### `hsl()` and `hsla()`

The `hsla()` function is identical to `hsl()`, except that if it would return a
plain CSS function named `"hsl"` that function is named `"hsla"` instead.

* ```
  hsl($hue, $saturation, $lightness, $alpha: 1)
  ```

  * If any argument is a [special number][], return a plain CSS function
    string with the name `"hsl"` and the arguments `$hue`, `$saturation`,
    `$lightness`, and `$alpha`.

  * If any of `$hue`, `$saturation`, `$lightness`, or `$alpha` aren't numbers
    or the keyword `none`, throw an error.

  * Let `hue` be the result of [normalizing](#normalizing-hue) `$hue`, with
    `convert-none` set to `false`.

  * If `$saturation` and `$lightness` don't have unit `%`, throw an error.

  > Clamping and conversion to rgb have been removed.

  * Let `alpha` be the result of [percent-converting][] `$alpha` with a `max` of 1.

  * Return a [legacy color][] in the `hsl` space, with the given `hue`,
    `$saturation`, and `$lightness` channels, and `alpha` value.

* ```
  hsl($hue, $saturation, $lightness)
  ```

  * If any argument is a [special number][], return a plain CSS function string
    with the name `"hsl"` and the arguments `$hue`, `$saturation`, and
    `$lightness`.

  * Otherwise, return the result of calling `hsl()` with `$hue`, `$saturation`,
    `$lightness`, and `1`.

* ```
  hsl($hue, $saturation)
  ```

  * If either argument is a [special variable string][], return a plain CSS
    function string with the name `"hsl"` and the same arguments.

  * Otherwise, throw an error.

* ```
  hsl($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` with an `hsl` space.

  * If `components` is null, return a plain CSS function string with the name
    `"hsl"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `hue`, `saturation`, and `lightness` be the three elements of `channels`.

  * Return the result of calling `hsl()` with `hue`, `saturation`, `lightness`,
    and `alpha` as arguments.
