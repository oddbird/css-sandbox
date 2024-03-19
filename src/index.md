---
title: OddBird CSS Sandbox
created: 2020-11-09
---

This is a sandbox for
[Miriam Suzanne](https://oddbird.net/authors/miriam/)
and [OddBird](https://oddbird.net/)
to document our notes
related to
[CSS Working Group](https://github.com/w3c/csswg-drafts/),
[Sass language](https://sass-lang.com/),
and related web platform features.
Everything here is un-official and incomplete,
as we do our thinking in public.

[gh]: https://github.com/oddbird/css-sandbox
[drafts]: https://github.com/w3c/csswg-drafts/issues

[Links & Resources »](/resources/)

{% import "base/list.macros.njk" as list %}

## Proposals & Explainers

{{ list.all(collections.explainer, collections) }}

{% note 'progress emoji' %}
- ✅ implemented, shipped, and complete
- 🚀 implementation underway, beginning to ship
- 👍 approved to proceed on a standards track
- 📝 research stage, or unofficial draft proposal
- ❌ rejected or abandoned (at least for now)
{% endnote %}

## Research Topics

{{ list.all(collections.index, collections) }}
