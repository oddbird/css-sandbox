---
title: Interpolated Values
eleventyNavigation:
  key: interpolation
  title: Interpolated Values
  parent: rwd
---

Breakpoints only get you so far.
In many cases it would be better to have units
and values that can respond more fluidly to context.
We can do some of that with [viewport-units](),
but that approach comes with a number of limitations.

[Scott Kellum](https://twitter.com/ScottKellum)
has been doing interesting work in this area --
what he calls "Intrinsic Typography" --
applying animation/transition concepts
like "easing" and "keyframes"
to responsive type.

## Resources

- Scott: [Typetura Docs](https://docs.typetura.com/)
- CSSWG: [Split CSS event bindings from application](https://github.com/w3c/csswg-drafts/issues/4343)
- [Intrinsic Typography](https://docs.google.com/document/d/1ls7TyGRh7YwkzAb2xOGmSK69d-BThHi0fJ44YdjO2zw/edit#heading=h.jne3slr8ak1x)
- [Query Interpolation Proposal](https://gist.github.com/scottkellum/0c29c4722394c72d311c5045a30398e5)

==TODO: Look into this more...==

## Thoughts

### Overlap with Scroll Animations

This reminds me of the proposed
[`@scroll-timeline`](https://drafts.csswg.org/scroll-animations-1/#scroll-timeline-at-rule) --
and I see Scott had the same thought:

[Split CSS event bindings from application](https://github.com/w3c/csswg-drafts/issues/4343)

I think the syntax could use some finesse,
but that direction _feels right_ to me --
building on current animation/transition syntax,
to make it work with inputs other than "time"
(like scrolling, or container-width).
