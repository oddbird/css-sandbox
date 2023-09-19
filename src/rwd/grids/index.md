---
title: CSS Grid Improvements
created: 2020-11-10
index: grids
changes:
  - time: 2021-05-19
    log: Link to overflow fragmentation proposal
  - time: 2021-10-05T13:09:35-06:00
    log: Link to gap-styling proposal & grid-area discussion
  - time: 2021-10-20T13:07:53-06:00
    log: Link Rachel Andrew on multicol & page fragments
---

As part of my work on Container Queries,
I've been taking a broad look
at the state of "responsive components" --
especially in relation to grid & flex layouts.
Are there ways we can improve the tools we have,
to help address the goal of "container queries"
inside the layout tools themselves?

Auto-fit and auto-fill grids
can be particularly helpful for
adjusting grid layouts to fit available space --
but they come with several limitations.

This is a collection of potential improvements,
linked to Github issues where appropriate.

## Auto-flow issues

Even when auto-flow is sparse,
most elements backfill.
The logic here is very unclear to authors.
[See a demo on codepen](https://codepen.io/miriamsuzanne/pen/QWdPvQV).
It would be useful to control that
with some more clarity.

## Responsive track spanning

Some of the most common grid issues
stem from the difficulty of placing items
in relation to implicit or auto-fit/auto-fill grids.
There are several useful ideas here:

We often want to span
multiple columns/rows
_only when they are available_
in the explicit, auto-generated grid.
That would require the
[ability to clamp track spanning (#5852)](https://github.com/w3c/csswg-drafts/issues/5852)
with a syntax like the proposed
`span-minmax(1, 3)`.

When mixing explicit & implicit grids,
it would be useful to align with
(span from or too)
the first or last line --
which could be explicit (`1`/`-1`),
but might also be implicit.
That is discussed some in
[span to last track... (#2402)](https://github.com/w3c/csswg-drafts/issues/2402).

That problem gets even larger
when you consider aligning the `-end` value,
while maintaining auto-placement for the `-start` value.
All of these issues are addressed together,
with an initial prototype,
by
[indefinite spans (#388)](https://github.com/w3c/csswg-drafts/issues/388).

==TODO: write up proposal, and file on CSSWG==

## Styling grid abstractions

There have been many requests to style
the individual grid cells/tracks/areas,
as well as the gaps between them.

### Grid/flex/multi-column gap-rules

Fantasai opened a large thread
to discuss the
[styling gaps/gutters (#2748)](https://github.com/w3c/csswg-drafts/issues/2748) --
using or building on `column-rule`.
This approach would ideally be generic,
applying to grid, flexbox, and multi-column layouts.
(This was discussed by the Working Group in May 2020,
with a request for more "white-boarding" of options)

I worked with fantasai last week
to flesh out
a proposal for styling gaps,
by expanding on the `column-rule` property
currently supported on multicolumn layouts:

Proposal: https://wiki.csswg.org/ideas/gutter-styling

### Grid cells, tracks, and areas

There are multiple issues
related to styling cells, tracks, and areas.
This can take various forms,
and overlap with a number of other issues.
One idea is to select grid-items
based on their auto-placement (track or cell) --
see [target items in nth-row of implicit grid (#1943)](https://github.com/w3c/csswg-drafts/issues/1943) --
but that might cause recursion issues.

More directions
are explored in the issue thread for
[decorative grid-cell pseudo-elements (#499)](https://github.com/w3c/csswg-drafts/issues/499).

Jen Simmons has
proposed an `@region` rule,
with named areas that feel over-complicated
for this narrow use-case,
but she [expands on it to solve other issues](https://speakerdeck.com/jensimmons/proposal-to-csswg-sept-2016?slide=47),
more aligned with "regions" generally.

For the simpler use-case of decorative styling
on cells/tracks/areas,
I like Tab Atkins proposal
of a `::grid-area()` pseudo-element:

```css
#grid::grid-area(1 / 2 / 3 / 4) {
  background-color: red; /* etc */
  /* grid-positioning properties are blacklisted */
}
```

But it does raise a few questions for me:
- How do overlapping area styles "stack" on a z-index?
- Do we really need to define the area in the pseudo-element function?

Fantasai and I
[put together a proposal](https://github.com/w3c/csswg-drafts/issues/499#issuecomment-926122734)
based on the pseudo-element above,
and the CSSWG resolved to
have Jen Simmons & Rachel Andrew
write up a draft specification.

## Managing grid flow and areas

==@@@ Flesh out the rest of these==

- [Default Grid Columns, Rows, and Areas (#4002)](https://github.com/w3c/csswg-drafts/issues/4002)
- [Add a flex/grid-clear property (#3974)](https://github.com/w3c/csswg-drafts/issues/3974)
- [Auto-placement aligning to a named line (#796) (✅ css-grid-3)](https://github.com/w3c/csswg-drafts/issues/796)
- ['auto' keyword should work with name grid lines/areas (#3243)](https://github.com/w3c/csswg-drafts/issues/3243)
- [Flow multiple elements together into same grid area (#1183)](https://github.com/w3c/csswg-drafts/issues/1183)
- [Allow auto-placement to use areas (#4457)](https://github.com/w3c/csswg-drafts/issues/4457)
- [Grid area as element (#4416)](https://github.com/w3c/csswg-drafts/issues/4416)
- [Automatically span rows and columns based on content size (#1373)](https://github.com/w3c/csswg-drafts/issues/1373)

### Regions & fragmentation

There's a real interesting
[Working Draft of CSS Overflow](https://www.w3.org/TR/css-overflow-4/)
that includes [fragmentation](https://www.w3.org/TR/css-overflow-4/#fragmentation)
as an overflow value.
That could be combined with various layout modules,
to create a very flexible approach to CSS Regions.

Rachel Andrew has also
[talked about this need](https://rachelandrew.co.uk/archives/2020/04/07/making-things-better/)
specifically in relation to `multicol` layout --
and points out that fragmented overflow
already exists for "paged media"
(print, ebooks, etc).

> **In a paged context you can take content
> and flow it through as many pages
> as are needed to contain it.**
> But if you think about
> creating web site or application with defined screens,
> how different is that to paged media?
> Perhaps not very.

I agree.

## Defining Grids

- [Overlapping cells in grid-template-areas syntax (#2808)](https://github.com/w3c/csswg-drafts/issues/2808)
- [Aspect ratio units needed (#1173)](https://github.com/w3c/csswg-drafts/issues/1173)
- [Repeating named grid areas (#3242)](https://github.com/w3c/csswg-drafts/issues/3242)
- [Specify an optional sequence of track sizes (#3328)](https://github.com/w3c/csswg-drafts/issues/3328)
- [Set adjusted-to-fit repeated track sizes (#3767)](https://github.com/w3c/csswg-drafts/issues/3767)

## Sub-grid improvements

- [Ability to name grids and reference them from subgrids (#1375)](https://github.com/w3c/csswg-drafts/issues/1375)

## Improving grid gaps

- [Collapse grid-gap when item is hidden. (#5813)](https://github.com/w3c/csswg-drafts/issues/5813)
- [Control size of individual gutters independently (#1659)](https://github.com/w3c/csswg-drafts/issues/1659)

## Notes

enhancements to level 1:
- Fit/fill require all columns to be identical
- There is no way to span "extra" gutters adjacent to a space
- interplay between auto/explicit placement
  - need ability to say `more-sparse` fill
  - cell margins/spacing (leaving cells empty)
- can we have inconsistent gaps?
