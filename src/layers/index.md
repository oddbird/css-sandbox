---
title: Cascade Layers
created: 2020-11-12
changes:
  - time: 2021-09-16
    log: Article and tests for Cascade Layers
  - time: 2021-10-05T11:36:34-06:00
    log: Include full resource list
  - time: 2021-10-05T16:12:53-06:00
    log: Update Chrome feature flag
  - time: 2022-01-25T11:58:34-07:00
    log: Link to Smashing Article
eleventyNavigation:
  key: layers
  title: Cascade Layers
  parent: home
warn: false
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

## My Notes

{{ collections.all | eleventyNavigation('layers') | eleventyNavigationToHtml | typogr | safe }}

## Specification

- [Editor's Draft](https://drafts.csswg.org/css-cascade-5/)
- [Working Draft](https://www.w3.org/TR/css-cascade-5/)

## Issues

- [Github Project](https://github.com/w3c/csswg-drafts/projects/15)
- [Github Cascade-5 label](https://github.com/w3c/csswg-drafts/labels/css-cascade-5)
- [Initial Proposal](https://github.com/w3c/csswg-drafts/issues/4470)
- [Request for TAG review](https://github.com/w3ctag/design-reviews/issues/597)

## Support

- [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
  by **Rachel Andrew**
- [Can I use...](https://caniuse.com/css-cascade-layers)
- [Web Platform Tests](http://wpt.live/css/css-cascade/)
  (Cascade Layer tests all begin with the `layer-` prefix)

## Implementation

- [Mozilla Layers](https://bugzilla.mozilla.org/show_bug.cgi?id=1699214)
  (`about:config` » `layout.css.cascade-layers.enabled`)
- [Webkit Layers](https://bugs.webkit.org/show_bug.cgi?id=220779)
  (`Develop`/`Experimental Features` » `CSS Cascade Layers`)
- [Chromium Layers](https://crbug.com/1095765)
  (`chrome://flags/` » `Enable CSS Cascade Layers`)

## Talks & Podcasts

- [CSSWG Proposals](https://slides.oddbird.net/csswg/)
- [Styling the Intrinsic Web](https://www.oddbird.net/talks/intrinsic-web/)
  ([slides](https://slides.oddbird.net/css-next/))
- [Front End Nerdery](https://www.oddbird.net/2021/08/15/fe-nerdery-10/)
- [Container Queries & The Future of CSS](https://www.oddbird.net/talks/responsive-components/)
  ([slides](https://slides.oddbird.net/css-next/))
- [Syntax.fm](https://www.oddbird.net/2021/06/16/syntaxfm-362/)
- [Word Wrap Show](https://www.oddbird.net/2021/05/17/word-wrap-11/)
- [The F-Word](https://www.oddbird.net/2021/05/06/f-word-11/)
- [Smashing Podcast](https://www.oddbird.net/2021/05/04/smashing-36/)

## Articles & Demos

- [OddBird Resources](https://www.oddbird.net/tags/cascade-layers/)
- [The Future of CSS: Cascade Layers (CSS @layer)](https://www.bram.us/2021/09/15/the-future-of-css-cascade-layers-css-at-layer/)
  by **Bramus Van Damme**
- [Getting Started With CSS Cascade Layers](https://www.smashingmagazine.com/2022/01/introduction-css-cascade-layers/)
  by **Stephanie Eckles**
- [Layers CodePen collection](https://codepen.io/collection/BNjmma)
