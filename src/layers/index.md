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

## Browser Implementations

- **Firefox**:
  - [Tracking issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1699215)
  - In Firefox Nightly,
    go to `about:config`
    and toggle the
    `layout.css.cascade-layers.enabled`
    feature flag.
- **Blink** (Chrome/Edge):
  - [Tracking issue](https://crbug.com/1095765)
  - In Chrome Canary,
    this currently requires a
    [run-time flag](https://www.chromium.org/developers/how-tos/run-chromium-with-flags)
    (`--enable-blink-features=CSSCascadeLayers`)
    while opening the browser from the command line.
- **Webkit** (Safari):
  - [Tracking issue](https://bugs.webkit.org/show_bug.cgi?id=220779)

## Web Platform Tests

See http://wpt.live/css/css-cascade/.
Cascade Layer tests all begin with the `layer-` prefix.

## Articles

- [The Future of CSS: Cascade Layers (CSS @layer)](https://www.bram.us/2021/09/15/the-future-of-css-cascade-layers-css-at-layer/)
  by **Bramus Van Damme**
