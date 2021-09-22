---
title: Miriam's CSS Sandbox
created: 2020-11-09
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

## My Notes (So Far) On…

{{ collections.all | eleventyNavigation('home') | eleventyNavigationToHtml | typogr | safe }}
