---
created: 2023-04-17
title: Overflow Extensions
eleventyNavigation:
  key: overflow
  title: Overflow Extensions
  parent: home
---

Managing content 'overflow' effectively on the web
requires a careful balance
of semantics, presentation,
and interactions.
While existing scroll/snapping
and disclosure widgets
provide a partial solution,
authors often have to cobble together
tabs, carousels, and accordions
from an incomplete set of tools.

Rather than developing a proposal
to handle one of these patterns,
I'm interested in what tools are needed
to make the existing patterns easier to build
effectively and accessibly.

## Our notes

{{ collections.all | eleventyNavigation('overflow') | eleventyNavigationToHtml | typogr | safe }}
