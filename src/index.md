---
title: Miriam's CSS Sandbox
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
to take notes & document ideas
related to the
[CSS Working Group](https://github.com/w3c/csswg-drafts/)
and CSS Specifications.

The real conversation happens in [CSSWG issue threads][drafts] --
but I wanted a place to gather my own thoughts
around those conversations.
Everything here is just un-official **work-in-progress** --
an ever-changing reflection of my own personal thoughts.

[gh]: https://github.com/oddbird/css-sandbox
[drafts]: https://github.com/w3c/csswg-drafts/issues

## My Notes (So Far)

{{ collections.all | eleventyNavigation('home') | eleventyNavigationToHtml | typogr | safe }}

## External Proposals

Some of my notes & proposals
(written in collaboration with fantasai)
are documented on the [CSSWG Wiki](https://wiki.csswg.org/ideas):

- [Margin Collapse Controls](https://wiki.csswg.org/ideas/margin-collapsing)
- [Timelines and Interpolation](https://wiki.csswg.org/ideas/timelines)
- [Column and Row Gaps and Rules](https://wiki.csswg.org/ideas/gutter-styling)
- [Logical (Flow-relative) Syntax](https://wiki.csswg.org/ideas/logical-syntax)
