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
we have begun to implement some
[sample code with tests](https://github.com/oddbird/sass-colors-sample).
{% endnote %}

## Table of Contents

{% note 'ToDo' %}
See auto-generated TOC in header.
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

{% note %}
Improvements to the proposed algorithm
are being discussed
[on GitHub](https://github.com/w3c/csswg-drafts/issues/7135#issuecomment-1066121795)
{% endnote %}

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

A *color* is an object with several parts:

* A string [*color space*](#color-space)

* An ordered list of *channel* values [as defined by that color space](#color-space)

* A numeric *alpha* value which can be safely clamped in the `0-1` or `0%-100%`
  range. Values outside that range are allowed, but meaningless.

* A boolean *is-legacy* to indicate a [legacy color](#legacy-color)

### Legacy Color

> Both Sass and CSS have similar legacy behavior that relies on all colors
> being interchangeable as part of a shared `srgb` color space. While the new
> color formats will opt users into new default behavior, some legacy color
> formats behave differently for the sake of backwards-compatibility.

Colors that are defined using the CSS color names, hex syntax, `rgb()`,
`rgba()`, `hsl()`, `hsla()`, or `hwb()` -- along with colors that result from
legacy interpolation -- are considered *legacy colors*. All legacy colors use
the `srgb` color space, with `red`, `green`, and `blue` channels. The output of
a legacy color is not required to match the input syntax.

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

[Legacy colors](#legacy-color) are converted to `srgb` internally, with any
missing channels (specified using the `none` keyword) set to `0`.

The color spaces and their channels are:

* `srgb` (RGB):
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

### Missing Components

In some cases, a color can have one or more missing components (channel or
alpha values). Missing components are represented by the keyword `none`. When
interpolating between colors, the missing component is replaced by the value
of that same component in the other color. In all other cases, the missing
value is treated as `0`.

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

  > The current spec has an open issue to determine if high values of
  > `lightness` (whites) should make the `a` and `b` values powerless.

* `lch`/`oklch`:

  * If the `chroma` value is 0%, then the `hue` channel is powerless.

  * If the `lightness` value is `0%`, then both the `hue` and `chroma` channels
    are powerless.

  > The current spec has an open issue to determine if high values of
  > `lightness` (whites) should make the `hue` and `chroma` values powerless.

### Color Gamuts

A _color gamut_ is a range of colors that can be displayed by a given device,
or described in a given color space. The predefined RGB gamuts are:

* `srgb`
* `display-p3`
* `a98-rgb`
* `prophoto-rgb`
* `rec2020`

There are several color spaces that are associated with the `srgb` gamut:

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

* Otherwise, if all the colors involved are *legacy colors*, use `srgb`.

* Otherwise, use `oklab`.

#### Hue Interpolation Methods

> When interpolating between polar-angle hue channels, there are multiple
> 'directions' the interpolation could move, following different logical rules.

The [hue interpolation methods][hue-interpolation] below are defined in
[CSS Color Level 4][color-4]. Unless the type of hue interpolation is
the value `specified`, both angles need to be constrained to `[0, 360)` prior
to interpolation.

> One way to do this is `n = ((n % 360) + 360) % 360`.

When no hue interpolation method is given, the default is `shorter`.

* [shorter](https://www.w3.org/TR/css-color-4/#shorter)

* [longer](https://www.w3.org/TR/css-color-4/#hue-longer)

* [increasing](https://www.w3.org/TR/css-color-4/#increasing)

* [decreasing](https://www.w3.org/TR/css-color-4/#decreasing)

* [specified](https://www.w3.org/TR/css-color-4/#hue-specified)

[hue-interpolation]: https://www.w3.org/TR/css-color-4/#hue-interpolation

## Procedures

### Converting a Color

Colors can be converted from one [color space](#color-space) to another.
Algorithms for color conversion are defined in the [CSS Color Level 4][color-4]
specification. Each algorithm takes a color `origin-color`, and a string
`target-space`, and returns a color `output-color`.

Colors defined in an RGB [color space](#color-space) using the the `color()`
function syntax, are referred to as _predefined RGB spaces_.

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

This procedure accepts an input argument `input` to parse, along with an
`expected` argument representing the number of color channels expected, then
throws any common parse errors if necessary, and returns either `null` (if the
syntax contains special CSS values), or a list of parsed values:

  * If `input` is a [special variable string][], return `null`.

  * If `input` is a bracketed list, or a list with a separator other than
    'slash' or 'space', throw an error.

  * If `input` is a slash-separated list:

    * If `input` doesn't have exactly two elements, throw an error.

    * Otherwise, let `channels` be the first element and `alpha` the second
      element of `input`.

  * Otherwise:

    * Let `channels` be an unbracketed space separated list of all except the
      last element of `input`.

    * If the last element of `input` is an unquoted string that contains `/`:

      * Let `split-last` be the result calling `string.split()` with the last
        element of `input` as the string to split, and `/` as the separator.

      * If there are not two items in `split-last`, throw an error.

      * If either item in `split-last` can be coerced to a number, replace the
        current value of the item with the resulting number value.

      * Let `alpha` be the second value in `split-last`, and append the first
        value of `split-last` to `channels`.

      > This solves for a legacy handling of `/` in Sass that would produce an
      > unquoted string when the alpha value is a css function such as `var()`
      > or when either value is the keyword `none`.

    * Otherwise, if the last element of `input` has preserved its status as two
      slash-separated numbers:

      * Let `alpha` be the number after the slash, and append the number before
        the slash to `channels`.

    * Otherwise, append the last element of `input` to `channels`

  * If `channels` is undefined or an empty list, throw an error.

  * If `channels` is not a [special variable string][]:

    * If `channels` is not an unbracketed space-separated list, throw an error.

    * If `channels` has more than `expected` elements, throw an error.

    * If any element of channels is not either a number, a special variable
      string, a special number string, or the keyword `none`, throw an error.

  * If `alpha` is undefined, let `alpha` be `1`.

  * Otherwise, If `alpha` is not either [special variable string][] or a
    special number string:

    * If `alpha` is a number, set `alpha` to the result of
      [percent-converting][] `alpha` with a max of 1.

    * Otherwise, if `alpha` is not the keyword `none`, throw an error.

  * If either `channels` or `alpha` is a special variable string, or if
    `alpha` is a special number string, return `null`.

  * If any element of `channels` is a [special variable string][] or a special
    number string, return `null`.

    > Doing this late in the process allows us to throw any obvious syntax
    > errors, even for colors that can't be fully resolved on the server.

  * If the length of `channels` is not equal to `expected`, throw an error.

    > Once special values have been handled, any colors remaining should have
    > exactly the expected number of channels.

  * Return an unbracketed slash-separated list with `channels` as the first
    element, and `alpha` as the second.

[special variable string]: ../spec/functions.md#special-variable-string
[percent-converting]: #percent-converting-a-number

### Normalizing Hue

This process accepts a `hue` angle, and boolean `convert-none` arguments. It
returns the hue normalized to degrees in a half-open range of `[0,360)` if
possible, converting `none` to `0` when requested. Otherwise
it throws an error for invalid `hue`.

* If the value of `hue` is `none`:

  * If `convert-none` is `true`, return `0`.

  * Otherwise, return `hue` without changes.

* Set `hue` to the result of converting `hue` to `deg` allowing unitless.

* Return `((hue + 1) % 360) - 1`.

### Interpolating Colors

This procedure accepts two color arguments (`color-1` and `color-2`), an
optional [color interpolation method](#color-interpolation-method) `method`,
and a percentage `distance` along the resulting interpolation path. It returns
a new color `mix` that represents the appropriate mix of input colors.

* Set `color-1` to the result of [premultiplying] `color-1`, and set `color-2`
  to the result of [premultiplying] `color-2`.

[premultiplying]: #premultiply-transparent-colors
[un-premultiplying]: #premultiply-transparent-colors

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

## Color Module Functions

These new and modified functions are part of the `sass:color` built-in module.

### `space()`

* ```
  space($color)
  ```

  * If `$color` is not a color, throw an error.

  * Return a quoted string with the name of `$color`s associated
    [color space](#color-space).

### `to-space()`

* ```
  to-space($color, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `origin-space` be the result of calling `space($color)`.

  * If `origin-space` equals-equals `$space`, return `$color`.

    > This allows unknown spaces, as long as they match the origin space.

  * If `$space` is not a [color space](#color-space), throw an error.

  * Return the result of [converting](#converting-a-color) the `origin-color`
    `$color` to the `target-space` `$space`.

### `is-legacy()`

* ```
  is-legacy($color)
  ```

  * If `$color` is not a color, throw an error.

  * Return `true` if `$color` is a [legacy color](#legacy-color), or `false`
    otherwise.

### `is-powerless()`

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

### `is-in-gamut()`

* ```
  is-in-gamut($color, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `space` be the value of `$space` if specified, or the result of calling
    `space($color)` otherwise.

  * If `space` is not a valid [color space](#color-space), throw an error.

  * Let `gamut` be the [color gamut](#color-gamuts) associated with `space`
    if an association is defined, or the value of `space` otherwise.

  * Let `color` be the result of calling `to-space($color, space)`.

  * For all bounded channels in `space`, if the associated channel value in
    `$color` is outside the bounded range, return `false`.

  * Otherwise, return `true`.

### `to-gamut()`

* ```
  to-gamut($color, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `origin-space` be the result of calling `space($color)` otherwise.

  * Let `target-space` be the value of `$space` if specified, or the value of
    `origin-space` otherwise.

  * If `target-space` is not a valid [color space](#color-space), throw an error.

  * Return the result of [gamut mapping](#gamut-mapping) with `$color` as the
    `origin` color, `origin-space` as the `origin color space`, and
    `target-space` as the `destination` color space.

### `channel()`

* ```
  channel($color, $channel, $space)
  ```

  * If `$space` is null:

    * Let `space` be the result of calling `space($color)`, and let `color` be
      the value of `$color`.

  * Otherwise:

    * Let `color` be the result of calling `to-space($color, $space)`, and let
      `space` be the value of `$space`.

  * If `space` is a valid [color space](#color-space), let `channels` be
    a map of channel names defined for `space`, and their corresponding values
    in `color`, or a map with 1-indexed number keys and their corresponding
    values in `color` otherwise.

  * Let `value` be the result of calling `map.get(channels, $channel)`.

  * If `value` is `null`, throw an error.

  * Otherwise, return `value`.

## New Global Functions

These new CSS functions are provided globally.

### `hwb()`

* ```
  hwb($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` with a `max` of 3.

  * If `components` is null, return a plain CSS function string with the name
    `"hwb"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `hue`, `whiteness`, and `blackness` be the three elements of `channels`.

  * Set `hue` to the result of [normalizing](#normalizing-hue) `hue` with
    `convert-none` set to `false`.

  * For each `channel` of `whiteness` and `blackness`, if `channel` is not `none`:

    * If `channel` doesn't have unit `%`, throw an error.

    * Set `channel` to the result of clamping `channel` between `0%` and `100%`.

  * If `whiteness + blackness > 100%` with values of `none` treated as `0`:

    * Set `whiteness` to `whiteness / (whiteness + blackness) * 100%`.

    * Set `blackness` to `blackness / (whiteness + blackness) * 100%`.

  * Return a color in the `hwb` space, with the given `hue`, `whiteness`,
    and `blackness` channels, and `alpha` value.

[parsing]: #parsing-color-components

### `lab()`

* ```
  lab($channels)
  ```

  * Let `components` be the result of [parsing] `$channels` with a `max` of 3.

  * If `components` is null, return a plain CSS function string with the name
    `"lab"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of
    `components`.

  * Let `lightness`, `a`, and `b` be the three elements of `channels`.

  * If `lightness` is a number without the unit `%`, throw an error.

  * If either of `a` or `b` is a number with a unit, throw an error.

  * ==todo==

### `lch()`

* ```
  lch($channels)
  ```

  * If `$channels` is a special number string, return a plain CSS function
    string with the name `"lab"` and the argument `$channels`.

  * If `$channels` is not an unbracketed space-separated list, throw an error.

  * If `$channels` does not include exactly three elements, throw an error.

  * Let `lightness` and `chroma` be the first two elements of `$channels`

  * If the third element of `$channels` has preserved its status as
    two slash-separated values:

    * Let `hue` be the number before the slash and `alpha` the number
      after the slash.

  * Otherwise:

    * Let `hue` be the third element of `$channels`.

  * If `chroma` is a number with a unit, throw an error.

  * If `lightness` is a number without the unit `%`, throw an error.

  * * If `hue` has any units other than `deg`, throw an error.

  * ==todo==


### `oklab()`

* ```
  oklab($channels)
  ```

  * If `$channels` is a special number string, return a plain CSS function
    string with the name `"lab"` and the argument `$channels`.

  * If `$channels` is not an unbracketed space-separated list, throw an error.

  * If `$channels` does not include exactly three elements, throw an error.

  * Let `lightness` and `a` be the first two elements of `$channels`.

  * If the third element of `$channels` has preserved its status as
    two slash-separated values:

    * Let `b` be the number before the slash and `alpha` the number
      after the slash.

  * Otherwise:

    * Let `b` be the third element of `$channels`.

  * If any of `lightness`, `a`, `b`, or `alpha` aren't numbers, or the keyword
    `none`, throw an error.

  * If `lightness` is a number without the unit `%`, throw an error.

  * If either of `a` or `b` is a number with a unit, throw an error.

  * ==todo==

### `oklch()`

* ```
  oklch($channels)
  ```

  * If `$channels` is a special number string, return a plain CSS function
    string with the name `"lab"` and the argument `$channels`.

  * If `$channels` is not an unbracketed space-separated list, throw an error.

  * If `$channels` does not include exactly three elements, throw an error.

  * Let `lightness` and `chroma` be the first two elements of `$channels`.

  * If the third element of `$channels` has preserved its status as
    two slash-separated values:

    * Let `hue` be the number before the slash and `alpha` the number
      after the slash.

  * Otherwise:

    * Let `hue` be the third element of `$channels`.

  * If `chroma` is a number with a unit, throw an error.

  * If `lightness` is a number without the unit `%`, throw an error.

  * * If `hue` has any units other than `deg`, throw an error.

  * ==todo==

### `color()`

* ```
  color($description)
  ```

  * If `$description` is a special number string, return a plain CSS function
    string with the name `"color"` and the argument `$channels`.

  * If `$description` is not an unbracketed space-separated list, throw an error.

  * Let `space` be the first element of `$description`.

  * If `space` is not an unquoted string, throw an error.

  * Let `channels` be a list of the remaining elements.

  * If the last element of `channels` has preserved its status as
    two slash-separated values:

    * Let `alpha` be the value after the slash.

    * Let the last element of `channels` be the value before the slash.

  * If `channels` or any element of `channels` is a special number string,
    return a plain CSS function string with the name `"color"` and the argument
    `$description`.

  * ==todo==


<!-- {% warn 'Questions' %}
…
{% endwarn %} -->

{% note 'ToDo' %}
- Legacy-function support for explicit `none` channels?
  - missing/powerless = 0 for legacy colors
  - legacy syntax (with commas or *a) does not accept `none`
- Unprefixed support for all new color functions
- Allow rgb inspection to return out-of-gamut values
- Extend `scale` to allow any channel with clear boundaries?
- Expand set/adjust/scale for new spaces
- Expand mix/compliment for new spaces
- For manipulating `none` (missing) channels:
  - `set()` overrides
  - `adjust()`/`scale()` throw errors (or assume 0???)
  - `channel()` returns `none`
- Add color-space args to interpolation functions
{% endnote %}
