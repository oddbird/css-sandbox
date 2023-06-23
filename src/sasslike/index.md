---
created: 2023-06-22
title: Sass Features in CSS
eleventyNavigation:
  key: sasslike
  title: Sass Features in CSS
  parent: home
---

Over the last decade,
several features have made the move
from Sass (and other pre-processors) to CSS --
most notably 'variables'
(as custom properties),
and now 'nesting'.

Here we consider
some of the other Sass structures,
and what advantages we would see
from moving them into CSS.

As a useful reference-point,
the HTTP Archive
has done some
[basic tracking of Sass usage](https://github.com/w3c/csswg-drafts/issues/5798)
across sites that provide
public Sass sourcemaps.

## Our notes

{{ collections.all | eleventyNavigation('sasslike') | eleventyNavigationToHtml | typogr | safe }}
