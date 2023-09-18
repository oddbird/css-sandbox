---
title: Sass Color Spaces
created: 2021-12-06
changes:
  - time: 2022-01-11T14:57:36-07:00
    log: More detail, with rough Sass suggestions
  - time: 2022-01-24T16:01:45-07:00
    log: Document css-color-4 functions and browser support
index: sass-color-spaces
parent: sass
---

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
