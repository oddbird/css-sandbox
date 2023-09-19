---
title: CSS Cascade Layers
created: 2020-11-12
index: layers
links:
  spec: css-cascade-5
  project: 15
  mdn: '@layer'
  caniuse: css-cascade-layers
  tag: 597
  wpt: css-cascade/?q=layer
changes:
  - time: 2021-09-16
    log: Article and tests for Cascade Layers
  - time: 2021-10-05T16:12:53-06:00
    log: Update Chrome feature flag
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
and avoid specificity or source-order conflicts across concerns.
