---
title: Cascade Layers
eleventyNavigation:
  key: layers
  title: Cascade Layers
  parent: home
---

While Cascade Origins help to balance styling concerns across stakeholders --
layering browser defaults, user preferences, and document styles --
it can be useful to have similar _layering of concerns_ within a single origin.
Author styles often start with browser normalization or resets,
then layer in default typography,
broad patterns (sometimes from design systems or frameworks),
and more specific component styles.
Currently that layering has to be achieved with careful management of selector-specificity,
or over-use of `!important` flags -- both resulting in unwanted side-effects.
Cascade Layers would allow authors to define their own layering scheme
and avoid specificity or source-order conflicts across layers.

This was proposed to the CSSWG at the end of 2019,
and was approved to move into the Cascade 5 specification.

## Cascade 5 Specification

- [Editor's Draft](https://drafts.csswg.org/css-cascade-5/)
- [Github Source](https://github.com/w3c/csswg-drafts/tree/master/css-cascade-5)
- [Initial Syntax Proposal](https://gist.github.com/mirisuzanne/4224caca74a0d4be33a2b565df34b9e7)

## Issues

- [Cascade 5 label](https://github.com/w3c/csswg-drafts/labels/css-cascade-5)
- [Cascade 5 + "layers"](https://github.com/w3c/csswg-drafts/issues?q=is%3Aopen+label%3Acss-cascade-5+layers)
- [Main CSSWG Issue](https://github.com/w3c/csswg-drafts/issues/4470)

Some specific issues:

- [Do we need a keyword similar to `revert`, but for cascade layers?](https://github.com/w3c/csswg-drafts/issues/5793)
- [Should unnamed cascade layers be allowed?](https://github.com/w3c/csswg-drafts/issues/5792)
- [What is the appropriate syntax for appending to nested layers?](https://github.com/w3c/csswg-drafts/issues/5791)
- [Cascade layers need an import syntax](https://github.com/w3c/csswg-drafts/issues/5681)
- [Where do Cascade Layers fit in the cascade?](https://github.com/w3c/csswg-drafts/issues/5003)
- [What is the migration path for Cascade Layers?](https://github.com/w3c/csswg-drafts/issues/4985)
- [How do Cascade Layers interact with Shadow DOM](https://github.com/w3c/csswg-drafts/issues/4984)
- [How do Cascade Layers interact with `!important`?](https://github.com/w3c/csswg-drafts/issues/4971)
- [What are the proper "levels" for managing Cascade Layers?](https://github.com/w3c/csswg-drafts/issues/4969)
- [Where do Cascade Layers fit in the cascade?](https://github.com/w3c/csswg-drafts/issues/5003)
