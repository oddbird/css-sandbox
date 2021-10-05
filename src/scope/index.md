---
title: Scope & Encapsulation
created: 2020-11-10
changes:
  - time: 2021-11-09
    log: Scope spec draft moved to Cascade-6
  - time: 2021-10-05T11:47:07-06:00
    log: Move prior art and questions, replace with resources
eleventyNavigation:
  key: scope
  title: Scope & Encapsulation
  parent: home
---

## Summary

Authors often complain that CSS is "globally scoped" --
so that every selector is compared against every DOM element.

There are several overlapping concerns here,
based on a wide range of use-cases --
and they can quickly become confused.
That has lead to a wide array of proposals
that are sometimes working towards different goals.

Both shadow-DOM
and the abandoned "scope" specification
were focused around strong isolation.
Shadow-DOM in particular creates persistent DOM-defined boundaries,
that impact all style rules.

Meanwhile,
most of the user-land "scope" tools for CSS
have a much lighter touch.
I've been mainly interested in those low-isolation,
namespacing problems.

## My notes

{{ collections.all | eleventyNavigation('scope') | eleventyNavigationToHtml | typogr | safe }}

## Specification

- [Editor's Draft](https://drafts.csswg.org/css-cascade-6/)

## Issues

- [Github Project](https://github.com/w3c/csswg-drafts/projects/21)
- [Github Cascade-6 label](https://github.com/w3c/csswg-drafts/labels/css-cascade-6)

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
