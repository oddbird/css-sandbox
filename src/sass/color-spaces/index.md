---
title: Sass Color Spaces
created: 2021-12-06
eleventyNavigation:
  key: sass-color-spaces
  title: Sass Color Spaces
  parent: sass
---

## Summary

Historically
CSS has been limited to a single color space (`sRGB`).
Over the years,
we've defined various formats to describe that space,
and the colors in it:
using hex notation `#rgb`/`#rrggbb`/`#rrggbbaa`,
cartesian functions `rgb()`/`rgba()`,
or more recent polar-angle functions `hsl()`/`hwb()`.

But the `sRGB` color space itself is limited
both in having a relatively narrow _color gamut_,
and in failing to be _perceptually uniform_.
Many monitors now support wider color gamuts
(such as the popular display-p3),
and there has also been significant progress
in developing more perceptually uniform color-spaces
such as LAB and okLAB.

The CSS Colors level 4 specification
describes how CSS authors can access these newer formats --
with okLAB as the default space for color-mixing.
We want to provide support for this in Sass:
with server-side tools to manage colors across spaces,
and convert colors between spaces where appropriate.

## Considerations

- Since existing formats have all worked within a single color-space,
  web authors are likely new to thinking about conversion across spaces.
- Conversions between spaces are well-defined,
  but handling _out-of-gamut_ colors during conversion is
  much more situational and complicated.
- Ideally we want to provide tools that make it
  simple for authors to begin exploring colors outside sRGB,
  while also giving detailed control to more experienced authors.

## Resources

- [Sass issue thread](https://github.com/sass/sass/issues/2831)
- [CSS Colors level 4](https://www.w3.org/TR/css-color-4/)
  ([Editor's Draft](https://drafts.csswg.org/css-color/))
- [Initial draft](https://github.com/sass/sass/pull/2832), from March 2020
