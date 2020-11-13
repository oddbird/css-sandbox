---
title: Miriam's CSS Sandbox
eleventyNavigation:
  key: home
---

This is a scratch site for
[Miriam Suzanne](https://oddbird.net/authors/miriam/)
to take notes & document ideas
related to the
[CSS Working Group](https://github.com/w3c/csswg-drafts/)
and CSS Specifications.

The real conversation happens in [CSSWG issue threads][drafts].
That is where bigger conversations happen,
and decisions are made --
but I wanted a place to gather my own thoughts
around those conversations.

Everything here is an un-official **work-in-progress** --
an ever-changing reflection of my own personal thoughts.

[gh]: https://github.com/oddbird/css-sandbox
[drafts]: https://github.com/w3c/csswg-drafts/issues

## My Notes (So Far) On…

{{ collections.all | eleventyNavigation('home') | eleventyNavigationToHtml | typogr | safe }}
