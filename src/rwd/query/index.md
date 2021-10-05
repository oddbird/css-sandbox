---
title: Container Queries
created: 2020-11-14
changes:
  - time: 2021-09-24T18:49:57-06:00
    log: Remove old resources and clarify current status
  - time: 2021-10-05T11:36:34-06:00
    log: Include full resource list
eleventyNavigation:
  key: container-queries
  title: Container Queries
  parent: rwd
---

While media queries provide a method
to query aspects of the user agent or device environment
that a document is being displayed in
(such as viewport dimensions or user preferences),
container queries allow testing aspects
of elements within the document
(such as box dimensions or computed styles).

## My Notes

{{ collections.all | eleventyNavigation('container-queries') | eleventyNavigationToHtml | typogr | safe }}

## Specification

- [Editor's Draft](https://drafts.csswg.org/css-contain-3/)

## Issues

- [Github Project](https://github.com/w3c/csswg-drafts/projects/18)
- [Github Contain-3 Label](https://github.com/w3c/csswg-drafts/issues?q=is%3Aopen+is%3Aissue+label%3Acss-contain-3)
- [Request for TAG review](https://github.com/w3ctag/design-reviews/issues/592)

## Support

- [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
  by **Rachel Andrew**
- [Can I use...](https://caniuse.com/css-container-queries)

## Implementations

- [Chromium](https://crbug.com/1145970) --
  in Chrome Canary, go to `chrome://flags` & "Enable CSS Container Queries"
  (This is a draft prototype and may not match the final design)

It's likely that no polyfill can perfectly emulate
the feature as specified,
but hopefully we can handle the most common use-cases.

- [CQFill](https://github.com/jsxtools/cqfill)
  by **Jonathan Neal** --
  still a very early prototype/proof-of-concept,
  requiring both pre-processor compilation (available for PostCSS)
  and run-time JS (using ResizeObserver).

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

- [OddBird Resources](https://www.oddbird.net/tags/container-queries/)
- [Container Queries: a Quick Start Guide](https://www.oddbird.net/2021/04/05/containerqueries/)
  by **David Herron**
- [A Primer On CSS Container Queries](https://www.smashingmagazine.com/2021/05/complete-guide-css-container-queries/)
  by **Stephanie Eckles**
- [Say Hello To CSS Container Queries](https://ishadeed.com/article/say-hello-to-css-container-queries/)
  by **Ahmad Shadeed**
  ([annotated on CSS Tricks](https://css-tricks.com/say-hello-to-css-container-queries/)
  by **Robin Rendle**)
- [CSS Container Queries For Designers](https://ishadeed.com/article/container-queries-for-designers/)
  by **Ahmad Shadeed**
- [Container Queries in Web Components](https://mxb.dev/blog/container-queries-web-components/)
  by **Max Böck**
- [Container Queries are actually coming](https://piccalil.li/blog/container-queries-are-actually-coming)
  by **Andy Bell**
- [CSS Container Queries: A First Look + Demo](https://www.bram.us/2021/03/28/css-container-queries-a-first-look-and-demo/)
  by **Bramus Van Damme**
- [Next Gen CSS: @container](https://css-tricks.com/next-gen-css-container/)
  by **Una Kravets**
- [CSS Container Queries: Use-Cases And Migration Strategies](https://www.smashingmagazine.com/2021/05/css-container-queries-use-cases-migration-strategies/)
  by **Adrian Bece**
- [Twitch live-stream highlights](https://www.twitch.tv/collections/8k9OzUpxdxb9VA)
  & [summary](https://www.twitch.tv/videos/993981213?collection=8k9OzUpxdxb9VA)
  by **Stephanie Eckles**
- [My CodePen collection of demos](https://codepen.io/collection/XQrgJo)

Query Units:

- [CSS Container Query Units](https://ishadeed.com/article/container-query-units/)
  by **Ahmad Shadeed**
- [Container Units Should Be Pretty Handy](https://css-tricks.com/container-units-should-be-pretty-handy/)
  by **Chris Coyier**

See Also:

- [Awesome-Container-Queries](https://github.com/sturobson/Awesome-Container-Queries)
  by **Stuart Robson**

## Proposals

- 2020 [`@container` proposal](https://github.com/dbaron/container-queries-implementability)
  by **David Baron**
- 2020 [`switch()` proposal](https://bkardell.com/blog/AllThemSwitches.html)
  by **Brian Kardell**
