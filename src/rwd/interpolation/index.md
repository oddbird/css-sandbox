---
title: CSS Interpolated Values
index: interpolation
created: 2020-11-13
changes:
  - time: 2021-09-22T00:35:28-04:00
    log: Brief notes on @timeline and interpolation function
  - time: 2021-09-23T00:11:02-04:00
    log: Link to fantasai/mia proposal for interpolation & timelines
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

## Proposal

Fantasai and I worked on a proposal to address & unify
a number of related use-cases around interpolation & timelines:

Timelines can be defined in relation to:
- how far a scroll-container has scrolled
- how long an element is "in-view" while being scrolled
- media and container-query features that have a range value

Some timelines can be used to control animations
(aka scroll-linked animations),
but we also propose some form of interpolation function
(currently called `mix()`)
that can apply a timeline and easing function
to a single propery.

There's more to the proposal.
Check it out:

https://wiki.csswg.org/ideas/timelines

## Resources

From Scott:
- [Typetura Docs](https://docs.typetura.com/)
  & [Demos](http://demos.Typetura.com)
- [Intrinsic Typography, CSS Tricks Article](https://css-tricks.com/intrinsic-typography-is-the-future-of-styling-text-on-the-web/)
- [Query Interpolation proposal](https://gist.github.com/scottkellum/0c29c4722394c72d311c5045a30398e5)

CSSWG issues:
- [Interpolate values between breakpoints](https://github.com/w3c/csswg-drafts/issues/6245)
- [Split CSS event bindings from application](https://github.com/w3c/csswg-drafts/issues/4343)
- [Higher level CSS interpolation module](https://github.com/w3c/csswg-drafts/issues/5617)
- [Need method to interpolate variable font settings](https://github.com/w3c/csswg-drafts/issues/5635)
- [Native interpolation function in CSS](https://github.com/w3c/csswg-drafts/issues/581)

## Notes

A few notes from my conversations with Scott:

- The most common use-case
  is that each property has a start-value and end-value
  aligned to particular container sizes,
  and an easing curve to interpolate.
  This is more like a transition than a keyframe animation.
- While it's rare for a single property
  to have additional/intermediate "stops" defined,
  it is useful to define multiple properties in the same place,
  even with different start/end points.
  A keyframe animation with multiple stops
  makes that possible in Typetura.

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

I think there's potential here for a
shared `@timeline` at-rule
that could be used for:

- scroll timelines
- container-size timelines
- media-size timelines

(I also think this can all be done
without the `selector()` function,
but I need to look into it more.)

### Interpolation Function

The CSSWG resolved at one point
to add an interpolation function --
though the syntax/details are TBD.

That would require:

- an easing function
- a percentage that represents current interpolated position
  (potentially provided by a timeline)
- a list of values to interpolate
