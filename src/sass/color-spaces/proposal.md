---
title: Sass Color Spaces Proposal
created: 2022-03-11
changes:
  - time: 2022-04-04T15:56:51-06:00
    log: Defining color terms, procedures, and functions
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

CSS serialization converts all hex, rgb(a), hsla(a), hwb, and named colors
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

The color spaces and their channels are:

* `srgb` (RGB):
  * `red`
  * `green`
  * `blue`

  > Colors described in `rgb`, `hsl`, `hwb`, hex, and named keywords
  > are all part of the `srgb` color space.

* `srgb-linear` (RGB):
  1. `red`
  2. `green`
  3. `blue`
* `display-p3` (RGB):
  1. `red`
  2. `green`
  3. `blue`
* `a98-rgb` (RGB):
  1. `red`
  2. `green`
  3. `blue`
* `prophoto-rgb` (RGB):
  1. `red`
  2. `green`
  3. `blue`
* `rec2020` (RGB):
  1. `red`
  2. `green`
  3. `blue`
* `xyz`:
  1. `x`
  2. `y`
  3. `z`
* `xyz-d50`:
  1. `x`
  2. `y`
  3. `z`
* `xyz-d65`:
  1. `x`
  2. `y`
  3. `z`
* `lab`:
  1. `lightness`
  2. `a`
  3. `b`
* `lch`:
  1. `lightness`
  2. `chroma`
  3. `hue` (polar angle)
* `oklab`:
  1. `lightness`
  2. `a`
  3. `b`
* `oklch`:
  1. `lightness`
  2. `chroma`
  3. `hue` (polar angle)

### Extended Color Spaces

> While all the `srgb` formats create colors in a single shared color space,
> color interpolation and inspection functions may need access to these
> additional spaces.

The extended color spaces include all regular [color spaces](#color-space) in
addition to the following `sRGB`-based spaces:

* `hwb` (RGB):
  * `hue` (polar angle)
  * `whiteness`
  * `blackness`
* `hsl` (RGB):
  * `hue` (polar angle)
  * `saturation`
  * `lightness`

### Color Interpolation

> Color mixing and other color-channel adjustments rely on knowledge of the
> colors involved, as well as a color space for interpolation, and (for
> polar-angle spaces) the hue interpolation method.

#### Color Interpolation Method

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

#### Interpolating with Alpha

When the colors being interpolated are not fully opaque, they are transformed
into premultiplied color values as follows:

* For rectangular orthogonal color coordinate systems, all channels are
  multiplied by the alpha value.

* For cylindrical polar color coordinate systems, only the non-polar channels
  are multiplied by the alpha value.

#### Hue Interpolation Methods

==todo==

## Procedures

### Converting a Color

Colors can be converted from one [color space](#extended-color-spaces) to
another. Algorithms for color conversion are defined in the
[CSS Color Level 4][color-4] specification. Each algorithm takes a color
`origin-color`, and a string `target-space`, and returns a color `output-color`.
The algorithms are:

* [HSL to sRGB](https://www.w3.org/TR/css-color-4/#hsl-to-rgb)

* [sRGB to HSL](https://www.w3.org/TR/css-color-4/#rgb-to-hsl)

* [HWB to sRGB](https://www.w3.org/TR/css-color-4/#hwb-to-rgb)

* [sRGB to HWB](https://www.w3.org/TR/css-color-4/#rgb-to-hwb)

* [Lab to LCH, OKLab to OKLCH](https://www.w3.org/TR/css-color-4/#lab-to-lch)

* [LCH to Lab, OKLCH to OKLab](https://www.w3.org/TR/css-color-4/#lch-to-lab)

* [Between RGB spaces](https://www.w3.org/TR/css-color-4/#predefined-to-predefined)

* [Any RGB to Lab/OKLab](https://www.w3.org/TR/css-color-4/#predefined-to-lab-oklab)

* [Lab/OKLab to any RGB](https://www.w3.org/TR/css-color-4/#oklab-lab-to-predefined)

> For additional details, see the [Sample code for color conversions][convert].

[convert]: https://www.w3.org/TR/css-color-4/#color-conversion-code

### Parsing Color Components

This procedure accepts a single input argument `input` to parse, throws any
common errors if necessary, and returns either `null` (if the syntax contains
special CSS values), or a list of parsed values:

  * If `input` is a [special variable string][], return `null`.

  * If `input` is an unbracketed slash-separated list:

    * If `input` doesn't have exactly two elements, throw an error.

    * Otherwise, let `channels` be the first element and `alpha` the second
      element of `input`.

  * Otherwise:

    * If `input` is not an unbracketed space-separated list, throw an error.

    * Let `channels` be an unbracketed space separated list of all except the
      last element of `input`.

    * If the last element of `input` is an unquoted string that contains `/`,
      return `null`.

    * If the last element of `channels` has preserved its status as two
      slash-separated numbers:

      * Let `last` be the number before the slash and `alpha` the number after
        the slash.

      * Append the value of `last` to the end of `channels`.

  * If `channels` is not an unbracketed space-separated list, throw an error.

  * If either `channels` or `alpha` is a special variable string, or if
    `alpha` is a special number, return `null`.

  * If any element of `channels` is a [special variable string][] or a special
    number, return `null`.

    > This passes along variables to CSS before checking against to see if the
    > there are extra channel values explicitly given. ==Do we want to throw
    > an error for extra channels?==

  * If `alpha` is defined:

    * If `alpha` is not a number, throw an error.

    * Set `alpha` to the result of [percent-converting][] `alpha` with a `max`
      of 1.

  * Otherwise, let `alpha` be `1`.

  * Return an unbracketed slash-separated list with `channels` as the first
    element, and `alpha` as the second.

[special variable string]: ../spec/functions.md#special-variable-string
[percent-converting]: #percent-converting-a-number

## Color Module Functions

These new and modified functions are part of the `sass:color` built-in module.

### `space()`

* ```
  space($color)
  ```

  * If `$color` is not a color, throw an error.

  * Return a quoted string with the name of `$color`s associated
    [color space](#color-space).

### `is-legacy()`

* ```
  is-legacy($color)
  ```

  * If `$color` is not a color, throw an error.

  * Return `true` if `$color` is a [legacy color](#legacy-color), or `false`
    otherwise.

### `is-powerless()`

* ```
  is-powerless($color, $channel)
  ```

  * ==todo: defined space-by-space?==

### `is-in-gamut()`

* ```
  is-in-gamut($color, $space)
  ```

  * ==todo (is this a good name?)==

### `to-gamut()`

* ```
  to-gamut($color, $channel)
  ```

  * ==todo (is this a good name?)==

### `to-space()`

* ```
  to-space($color, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `origin-space` be the result of calling `space($color)`.

  * If `origin-space` equals-equals `$space`, return `$color`.

    > This allows unknown spaces, as long as they match the origin space.

  * If `$space` is not a [color space](#color-space), throw an error.

    > ==Should this allow extended/legacy color spaces, as aliases for srgb?==

  * Return the result of [converting](#converting-a-color) the `origin-color`
    `$color` to the `target-space` `$space`.

### `channel()`

* ```
  channel($color, $channel, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `space` be be the result of calling `space($color)` if `$space` is null,
    or `$space` otherwise.

  * Let `color` be the result of [converting](#converting-a-color) the
    `origin-color` `color` to the `target-space` `space`.

  * If `space` is a [known color space](#known-color-spaces), let `channels` be
    a map with channel names defined in `space`, and their corresponding values
    in `color`, or a map with 1-indexed number keys and their corresponding
    values in `color` otherwise.

  * Let `value` be the result of calling `map.get(channels, $channel)`.

  * If `value` is `null`, throw an error.

  * Otherwise, return `value`.

{% note %}
Do we want to deprecate the existing individual channel functions
(red, green, etc) to avoid confusion?
{% endnote %}

## Global Functions

These new CSS functions are provided globally.

### `hwb()`

* ```
  hwb($channels)
  ```

  * Let `components` be the result of [parsing] `$channels`.

  * If `components` is null, return a plain CSS function string with the name
    `"hwb"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of `components`.

  * If `channels` has more or fewer than three elements, throw an error.

  * Let `hue`, `whiteness`, and `blackness` be the three elements of `channels`.

  * Call `hwb()` with `hue`, `whiteness`, `blackness`, and `alpha` as arguments
    and return the result.

    > ==Check how CSS handles RGB in terms of legacy transforms/powerless values==

[parsing]: #parsing-color-components

### `lab()`

* ```
  lab($channels)
  ```

  * Let `components` be the result of [parsing] `$channels`.

  * If `components` is null, return a plain CSS function string with the name
    `"lab"` and the argument `$channels`.

  * Let `channels` be the first element and `alpha` the second element of `parsed`.

  * If `channels` has more or fewer than three elements, throw an error.

  * Let `lightness`, `a`, and `b` be the three elements of `channels`.

  * If any of `lightness`, `a`, and `b` aren't numbers or the keyword `none`,
    throw an error.

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


{% warn 'Questions' %}
- Legacy-function support for explicit `none` channels?
{% endwarn %}

{% note 'ToDo' %}
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
