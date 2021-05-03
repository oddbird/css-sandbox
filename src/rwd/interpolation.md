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
We can do some of that with relative units
(several JS plugins provide container-relative units),
but that approach comes with a number of limitations.

[Scott Kellum](https://twitter.com/ScottKellum)
has been doing interesting work in this area --
what he calls "Intrinsic Typography" --
applying animation/transition concepts
like "easing" and "keyframes"
to responsive type.

## Resources

From Scott:
- [Typetura Docs](https://docs.typetura.com/)
- [Intrinsic Typography, CSS Tricks Article](https://css-tricks.com/intrinsic-typography-is-the-future-of-styling-text-on-the-web/)
- [Query Interpolation proposal](https://gist.github.com/scottkellum/0c29c4722394c72d311c5045a30398e5)

CSSWG issues:
- [Interpolate values between breakpoints](https://github.com/w3c/csswg-drafts/issues/6245)
- [Split CSS event bindings from application](https://github.com/w3c/csswg-drafts/issues/4343)
- [Higher level CSS interpolation module](https://github.com/w3c/csswg-drafts/issues/5617)
- [Need method to interpolate variable font settings](https://github.com/w3c/csswg-drafts/issues/5635)
- [Native interpolation function in CSS](https://github.com/w3c/csswg-drafts/issues/581)

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
