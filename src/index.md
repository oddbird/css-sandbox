---
title: OddBird CSS Sandbox
created: 2020-11-09
changes:
  - time: 2021-10-05T12:52:11-06:00
    log: |
      Link CSSWG Wiki proposals for
      margin collapsing,
      timelines & interpolation,
      column & row gap rules,
      and flow-relative (logical) syntax
eleventyNavigation:
  key: home
---

This is a scratch site for
[Miriam Suzanne](https://oddbird.net/authors/miriam/)
and [OddBird](https://oddbird.net/)
to take notes & document ideas
related to the
[CSS Working Group](https://github.com/w3c/csswg-drafts/),
the [Sass language](https://sass-lang.com/),
and related web platform features.

Most conversations happen in [CSSWG issue threads][drafts] --
but we wanted a place to gather our thoughts
around those conversations.
Everything here is un-official **work-in-progress** --
an ever-changing reflection of
what we're working on and thinking about.

[gh]: https://github.com/oddbird/css-sandbox
[drafts]: https://github.com/w3c/csswg-drafts/issues

## Our Notes (So Far)

{{ collections.all | eleventyNavigation('home') | eleventyNavigationToHtml | typogr | safe }}
