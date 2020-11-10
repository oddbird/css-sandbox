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

Everything here is a **work-in-progress**.
I like to think out loud,
and make my notes available --
you are welcome to explore,
and even [open issues or pull-requests][gh] --
but **this is my own personal notebook,
and not a replacement for CSSWG issue threads**.

[gh]: https://github.com/oddbird/css-sandbox

## What I'm Working On…

{{ collections.all | eleventyNavigation('home') | eleventyNavigationToHtml | safe }}
