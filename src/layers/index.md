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
and avoid specificity or source-order conflicts across concerns.

This was proposed to the CSSWG at the end of 2019,
and was approved to move into the Cascade 5 specification.

{{ collections.all | eleventyNavigation('layers') | eleventyNavigationToHtml | typogr | safe }}
