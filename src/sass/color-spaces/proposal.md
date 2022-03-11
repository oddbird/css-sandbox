---
title: Sass Color Spaces Proposal
created: 2022-03-11
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
  distribution, so that similar adjustments achieve visually similar results.
- A *color space* is the result of projecting a color model into a coordinate
  system. Every color syntax in CSS projects colors into a specific space.
  For example, `rgb()` projects the RGB color model into a cubic coordinate
  space, and `hsl()` provides a cylindrical space. Different spaces will have
  different results when adjusting or interpolating colors.
- A *color gamut* is the full range of colors that can be described by a color
  space. Historically, all CSS spaces have been limited to the same sRGB gamut.
  However, modern computer monitors often support wider gamuts like display-p3.

### New CSS Color Spaces

The [CSS Color Level 4][color-4] specification defines a number of new color
spaces, representing both new color models and wider color gamuts.

In the future, all CSS color manipulation functions are designed to use the OK
color model by default, and the CIE model as a central reference for moving
between models. These models provide more *perceptually uniform* color math --
and can be accessed in either cubic (LAB) or cylindrical (LCH) space:

- (CIE) `lab()` is a cubic projection, using linear coordinates (like `rgb()`)
- (CIE) `lch()` is cylindrical, using polar angles for hue (like `hsl()`)
- `OKlab()` improves the perceptual uniformity of CIE LAB
- `OKlch()` improves the perceptual uniformity of CIE LCH

The new `color()` function provides access to a number of less common spaces.
The CIE XYZ spaces act as a central reference for conversion, with a gamut that
covers all human-visible colors.

- `color(<space> <x> <y> <z> / <a>)`:
  - `xyz-d50` (D50 reference white)
  - `xyz-d65` (D65 reference white)
  - `xyz` (Default D65 reference white)

The remaining spaces are all extensions of the RGB color model, providing
wider gamuts, improved bit-depth precision, or removing gamma-encoding:

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

### Missing & Powerless Color Components

[CSS Color Level 4][color-4] also adds support for 'missing' & 'powerless'
color components. For example, when converting a grayscale color (like `black`
or `gray`) to a polar-angle space like `hsl`, the resulting `hue` is unknown.
Similarly, at the extremes of `lightness` (eg `black` or `white`), both `hue`
and `saturation` become 'powerless' -- changing them has no impact.

This can now be represented in Sass syntax by using a value of `none`, so that
the color `white` becomes effectively `hsl(none none 100%)`. The `none` value
is treated as `0` in most cases, but when interpolating two colors, a `none`
value takes it's value from the other color involved.

This also allows interpolating specific channels of a color. For example,
any color can be animated towards 'grayscale' by mixing it with the color
`oklch(none 0% none)`.

### Color Conversion and Gamut Mapping

The [CSS Color Level 4][color-4] specification defines algorithms for
conversion between all the new and existing color spaces. Still, since some
spaces provide access to wider gamuts than others, it is possible for a
color defined or manipulated in one color space to be 'out-of-gamut' when
converted to another space.

There are various possible ways to 'map' an 'out-of-gamut' color to its nearest
in-gamut relative, and the spec provides some advice on how that can be done.
In order to avoid data-loss, it's often best to leave gamut-mapping as a detail
for the browser to manage, based on the gamut of the display. Still, it would
be good for Sass to provide some explicit gamut-mapping tools for authors to
use when converting newer color-systems into backwards-compatible output.

### Legacy Colors

Because all previously-available CSS color spaces provided the same gamut of
colors using the same color model, Sass has considered them interchangeable,
converting between them silently, and generating the 'optimal' output format.
In order to move forward while maintaining backwards compatibility, both CSS
and Sass will need to maintain some legacy handling for these legacy colors,
while providing a way to opt into the new defaults used by newer color syntax.

### Browser Support

WebKit/Safari is already shipping support for all these new color spaces,
and Gecko/Firefox has released some early drafts behind an experimental flag.
These features are also included as a goal of [Interop 2022][interop], which
makes it likely to roll out in all browsers by the end of the year.

## Summary

> This section is non-normative.

This proposal defines global (un-prefixed) Sass support for all of the
color functions in [CSS Color Level 4][color-4] (`hwb()`, `lab()`/`lch()`,
`oklab()`/`oklch()`, `color()`). All (new and existing) color functions are
also extended to support both:

- An awareness of color spaces and gamuts where appropriate
- `none` values (explicitly set, or generated during conversion/interpolation)

Additionally, this proposal provides new functions in the sass color module
for inspecting a color's space, and converting & gamut-mapping between spaces.

For the sake of backwards-compatibility, our list of supported color spaces
will include an internal `sass-rgb` space for legacy colors. While newer color
formats will maintain their original color space unless explicitly converted,
colors in the `sass-rgb` space will remain interchangeable.


### Design Decisions

CSS serialization converts all hex, rgb(a), hsla(a), hwb, and named colors
to their rgb(a) equivalent, as part of a shared `srgb` space. However:

- `hsl` and `hwb` remain distinct spaces for interpolation functions to use.
- the `color(srgb …)` syntax is also part of `srgb` space, but has higher bit
  depth, and opts out of legacy interpolation behavior.

We have attempted to match this behavior.

## Definitions

### Color

A *color* is an object composed of three parts:

* A string *color space*
* An ordered list of *channel* values
* A numeric *alpha* value
* A boolean *is-legacy* to indicate a [legacy color](#legacy-color)

{% note 'ToDo' %}
Need to formalize these terms and their relationships to other definitions,
like color spaces and channels?
{% endnote %}

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
> reason, individual color procedures and functions can establish their own
> color interpolation defaults, or provide a syntax for authors to explicitly
> choose the method that best fits their need.

When selecting a color interpolation method:

* If the host syntax defines what method to use use, use the specified method.

* Otherwise, if all the colors involved are *legacy colors*, use `srgb`.

* Otherwise, use `oklab`.

### Interpolating with Alpha

When the colors being interpolated are not fully opaque, they are transformed
into premultiplied color values as follows:

* For rectangular orthogonal color coordinate systems, all channels are
  multiplied by the alpha value.

* For cylindrical polar color coordinate systems, only the non-polar channels
  are multiplied by the alpha value.

### Hue Interpolation Methods

==todo==

### Defined Color Space

Every color is stored internally as part of a defined color space.
That space has a name, and an ordered list of associated channels that
can be accessed and manipulated in that space.

The defined color spaces and their channels are:

* `srgb`:
  * `red`
  * `green`
  * `blue`

  > Colors described in `rgb`, `hsl`, `hwb`, hex, and named keywords
  > are all part of the `srgb` color space.

* `srgb-linear`:
  1. `red`
  2. `green`
  3. `blue`
* `display-p3`:
  1. `red`
  2. `green`
  3. `blue`
* `a98-rgb`:
  1. `red`
  2. `green`
  3. `blue`
* `prophoto-rgb`:
  1. `red`
  2. `green`
  3. `blue`
* `rec2020`:
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
  3. `hue`
* `oklab`:
  1. `lightness`
  2. `a`
  3. `b`
* `oklch`:
  1. `lightness`
  2. `chroma`
  3. `hue`

{% note 'ToDo' %}
Define the acceptable values for each channel type here,
or in the color functions themselves?
{% endnote %}

### Interpolation Spaces

While all the `srgb` formats
create colors in a single shared color space,
interpolation and inspection functions
may need to distinguish between these spaces
more explicitly.
The additional RGB interpolation spaces
and their channels, are:

* `hwb`:
  * `hue`
  * `whiteness`
  * `blackness`
* `hsl`:
  * `hue`
  * `saturation`
  * `lightness`

## Color Module Functions

These new and modified functions are part of the `sass:color` built-in module.

### `space()`

* ```
  space($color)
  ```

  * If `$color` is not a color, throw an error.

  * Return a string with the name of the color space used for `$color`.

### `is-legacy()`

* ```
  is-legacy($color)
  ```

  * If `$color` is not a color, throw an error.

  * Return `true` if `$color` is a legacy color, or `false` otherwise.

### `to-space()`

* ```
  to-space($color, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `origin-space` be the result of calling `space($color)`.

  * If `origin-space` is equal to `$space`, return `$color`.

    > This allows unknown spaces, as long as they match the origin space.

  * If `$space` is not a *known color space*, throw an error.

  * Let `converted` be...

    > ==todo: do we need procedures for each type of conversion?==

  * Return `converted`.

### `channel()`

* ```
  channel($color, $channel, $space)
  ```

  * If `$color` is not a color, throw an error.

  * Let `origin-space` be the result of calling `space($color)`.

  * Let `space` be `origin-space` if `$space` is null, or `$space` otherwise.

  * Let `color` be the result of calling `to-space($color, space)`.

  * If `$channel` is a string:

    * ==todo: handle named channels==

  * Otherwise if `$channel` is a number

    * ==todo: handle numbered channels==


## Global Functions

These new CSS functions are provided globally.

### `hwb()`

* ```
  hwb($channels)
  ```

  * If `$channels` is not an unbracketed space-separated list, throw an error.

  * If `$channels` does not includes exactly three elements, throw an error.

  * Let `hue` and `whiteness` be the first two elements of `$channels`

  * If the third element of `$channels` has preserved its status as
    two slash-separated numbers:

    * Let `blackness` be the number before the slash and `alpha` the number
      after the slash.

  * Otherwise:

    * Let `blackness` be the third element of `$channels`.

  * Call `hwb()` with `hue`, `whiteness`, `blackness`, and `alpha` (if it's
    defined) as arguments and return the result.

### `lab()`

* ```
  lab($channels)
  ```

  * If `$channels` is a special number string, return a plain CSS function
    string with the name `"lab"` and the argument `$channels`.

  * If `$channels` is not an unbracketed space-separated list, throw an error.

  * If `$channels` does not include exactly three elements, throw an error.

  * Let `lightness` and `a` be the first two elements of `$channels`

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
