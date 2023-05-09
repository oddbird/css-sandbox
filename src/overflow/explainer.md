---
draft: 2023-04-17
title: Overflow Extensions Explainer
eleventyNavigation:
  key: overflow-explainer
  title: Explainer
  parent: overflow
---

{% warn %}
This is a high-level draft explainer
exploring issues with
(and possible extensions to) CSS overflow/layout --
especially in relation to common UX patterns
like tabs, carousels, and accordions.
This is not a complete proposal,
but a starting place for further conversation.
{% endwarn %}

## Authors

- Miriam Suzanne
- Robert Flack
- Nicole Sullivan

## Participate

Anyone can comment on,
file issues against,
or contribute to this explainer
on GitHub:

- [Explainer Document](https://github.com/oddbird/css-sandbox/blob/main/src/overflow/explainer.md)
- [Issue Tracker](https://github.com/oddbird/css-sandbox/issues)

We also rely heavily
on some existing proposals
discussed in the CSS Working Group
issue tracker:

- [[css-grid] Flow multiple elements together into same grid area][flow-items]
- [[css-grid] grid area as element][flow-element]
- [[css-grid] Decorative grid-cell pseudo-elements][style-area]
- [[css-multicol-2][css-scroll-snap] Snapping to column boxes][snap-boxes]

[flow-items]: https://github.com/w3c/csswg-drafts/issues/1183
[flow-element]: https://github.com/w3c/csswg-drafts/issues/4416
[style-area]: https://github.com/w3c/csswg-drafts/issues/499
[snap-boxes]: https://github.com/w3c/csswg-drafts/issues/6017

## Introduction

Managing the layout of content on the web
requires careful control of
'overflow' --
allowing content to be hidden
when it's not needed,
but accessibly discovered and revealed
when necessary.

There are many overlapping
user-interface design patterns
that can be used --
from (standard, continuous) scrolling
to accordions,
tabs, slideshows, carousels,
and various hybrid approaches.
The lines between these patterns
are often somewhat blurry:

- CSS currently supports several overflow values,
  but the only available overflow-access interface
  is the continuous scrolling container.
  That can be extended with features
  such as scroll-animation,
  scroll-behavior, scroll-snapping,
  and so on.
- At the other end of a spectrum,
  most tab and accordion patterns
  are highly structured & sectioned overflow.
  Each section has an interactive label
  that can be used to show or hide
  the section contents (often one-at-a-time).
- In-between those two extremes,
  there are a wide range of patterns
  that get referred to as 'carousels'.
  These are not limited to the (problematic)
  infinite-auto-advancing home-page widgets,
  but range from video-streaming
  media selection,
  to slide shows,
  and e-commerce product-image viewers.

There have been many attempts
over the years
to define new tab or carousel components --
but they are often held up by:

- The complexity of
  use-case mixing and matching
  patterns from scrollers, carousels,
  tabs, and accordions
- The need to work around many
  underlying features
  that are missing from the web platform
- The fact that 'overflow'
  is a presentational concern
  tightly coupled with device/media/size conditions
  (and therefor part of CSS),
  but also requires interactive controls
  generally left to HTML components or JavaScript.

## Goals

The goal of this explainer
is not to propose yet another component,
or provide a one-size-fits-all solution
for all overflowing UI --
but to consider some baseline improvements to CSS overflow
that could help authors
flesh out the details of each pattern more elegantly,
consistently, and accessibly.
This could also help form the scaffolding
for future components, as needed.

In some cases,
we're able to propose a path forward --
and in other cases,
we simply document the problem
and some of the tradeoffs
with different approaches.

### Overlapping patterns

The patterns we're looking at
fall along a continuum
of scrolled and paged overflow:

- On one end,
  media-scroller carousels
  (like the Netflix video selection interface)
  are similar to horizontal overflow
  with scroll-snapping,
  and the occasional use of 'next/previous' navigation
  that is sometimes linked to items
  and sometimes to 'pages' of overflow.
- Slide-show style carousels
  often add small 'scroll-markers' (like dots)
  that represent either
  the individual items listed,
  or the viewable pages
  (if multiple items appear at once).
- Product-image carousels will often
  replace the dots with thumbnail image scroll-markers,
  and only show one item per 'page'.
  In this case general mouse scrolling
  (and visible scroll-bars)
  are often removed in favor of tab controls,
  while sometimes leaving gesture-based scrolling intact.
- Tabs are similar,
  but may often removing scroll-controls entirely.

Rather than thinking of these
as distinct patterns,
we want to understand the underlying set of controls
that are combined to create
any given variation.
Primarily: paged overflow
and interactive scroll markers
in a variety of forms.

### Overflow changes based on context

While HTML, CSS, and JS
often have distinct and separate 'concerns' --
semantics, presentation, and interaction --
overflow falls into a middle ground
that can be hard to break apart.
Content that overflows on one device,
or at a particular screen size,
may not need to overflow in other situations.
That's a presentational concern,
rather than a semantic one,
and often needs to be handled using media queries.

However,
semantics do play a clear role in
what patterns make sense
(the difference between a carousel and tabs
often comes down to how content is sectioned),
and different types of 'overflow' require
different interactions.
Any solutions provided here
have to account for changes in overflow
based on device/media/container context --
and help authors access the proper interactions
and accessible roles
for each type of overflow.

## Non-goals

### Application-Level Tabs

The 'tabs' interface pattern
has two common
and somewhat distinct use-cases:

1. Managing display of sectioned content
   within a single document
2. Managing display of multiple documents
   within an application

The former can be seen
as a form of 'content overflow'
covered by by this proposal.
When searching within a document,
users would expect content in hidden sections
to be 'discoverable'.
On the other hand,
application level tabs
(such as in a browser or text-editor)
represent distinct documents
rather than 'overflow'.
Users would not expect a search in one document
to reveal content in another tab.

This proposal is specific to
handling content overflow presentation in HTML and CSS,
rather than providing a generic solution
to the 'tabs' interface design pattern.

### Auto-advancing & Cyclic Home Page Carousels

The term 'carousel'
has a strong negative connotation
in web design circles,
thanks to the poor user-experience
of home page carousels
used to display an endless cycle of
'featured' content.

Readers rarely interact with this pattern,
and generally don't see content
beyond the first page of the carousel,
unless forced by auto-advancement,
which causes a whole new list
of accessibility and usability issues.

While that makes us hesitant
to use the term 'carousel' here,
there are a range of much more essential use-cases
that fall under the term --
and it's helpful to understand
the somewhat fluid and overlapping nature of
scroll/carousel/tab/accordion patterns.

### Virtual lists

Virtual lists are tightly related to overflow,
but outside the scope of this document.

## Possible solutions

While previous proposals
have started with a new element
(eg `tabs` or `spicy-sections`),
we want to start by addressing the core HTML/CSS
layout and overflow issues
that make such an element difficult to implement.
This should provide a stepping-stone
for both authors and browser vendors
to explore and develop more narrowly defined
web-components or HTML elements
where they make sense.

### Paged overflow, in the browser

Simple carousels (or 'media-scrollers')
are often built with scrollable overflow
and scroll-snap targets.
What makes it a 'carousel' is the addition
of 'paged' navigation options:

- next/previous page arrows
- page markers (often dots)
  to show the number of pages
  and current active position

Paged overflow isn't a new idea in CSS.
While implementations have not always been
complete or consistent,
paged overflow is already well-defined for print,
and has a number of
[other use-cases](https://rachelandrew.co.uk/archives/2020/04/07/making-things-better/)
if it were available in the browser.

Establishing paged overflow on an element
would generate `::page` pseudo-element
[fragmentainers](https://developer.mozilla.org/en-US/docs/Glossary/Fragmentainer)
for descendant elements & content to flow through.

- pages are created as-needed
  based on the amount of content,
  and the size available to each page.
- by default, a page could be the size
  of the containing box (not including overflow),
  so that scrolling the view 100%
  would bring a new 'page' fully into view.
- Pages could be resized,
  which would impact how much content
  fits in a given page,
  how many pages are visible without scrolling,
  and how many pages are needed
  for the flow of content.
- Individual pages could be targeted
  using a syntax similar to `nth-child`

It's not immediately clear
what syntax would be best
for invoking this sort of paged overflow.
While this behavior is related to both `overflow`
and (in some ways) `display`,
neither property seems like a particularly good fit.

Paged use-cases (e.g. carousels)
might involve scrolling between pages,
while others (e.g. multicol wrapping) may not.
So pagination is not necessarily alternative to scrolled overflow.
Even if paged overflow had an `auto`-like scroll behavior,
to allow scrolling and non-scrolling pages,
single-axis paged overflow(`-x`/`-y`) doesn't make much sense.

Authors will also need a mechanism
for handling the layout of
elements within pages
(and the layout of the pages themselves) --
both of which require display values.
It's possible the pagination and layout controls
could be combined in a single property
(e.g. `display: paged grid`)
if it makes sense for them to cascade together.
Since display is a shorthand for
inside and outside values,
pagination would either need to be added
to one of those properties
or a third new display sub-property.

### Styling paged overflow

As mentioned above,
authors will need a way to provide
`display` values for both

1. the layout of `::page` elements themselves
2. the layout of child contents
  flowing through those pages

I would expect the overflowing/paginated parent element
to handle the layout of pages,
in which case
a new (`::page-contents`?) could be used
for the layout of content flowing through pages
(or vice versa).
An additional wrapping pseudo-element
like this might only support a limited subset of
CSS properties or pseudo-classes.

In some cases,
an author would style all `::page` elements,
but it would often be useful
to target specific pages
with e.g. `::page:nth-child(even)`
(or `::page(even)`).
However,
there might be recursion issues
with other combinations,
such as `::page:nth-last-child(even)`
or `::page:focus-within`,
if the styles applied
could change the number of pages
or placement of content in those pages.

{% note %}
Could these pseudo-classes be used for paged
(e.g. print) media as well?
{% endnote %}

### Generating markers with `::scroll-marker`

- Do we need a property on the parent scroller
  that generates the scroll-markers?
  `[[item | fragment | snap] marker || paged] | normal`
- Or are they generated via `content` on the marker itself?
  If so, can markers be generated for multiple things?
- Can generated elements be interactive controls?
- Style the active marker
  as a 'descendant' of the snapped fragment or item?
  Does this require `@container state(snapped)` or similar?

```css
.carousel::page::scroll-marker {
  grid-area: markers;
  content: '';
  background: element();
}
```

### Semantic item scroll-markers / tabs

- An attribute (or property?) for assigning scroll-marker behavior
- A way to 'hoist' the element into a parent grid context
  (see layout section)

```html
<tabs>
  <section>
    <h2 marker>tab label</h2>
    <div class='panel'>tab panel</div>
  </section>
  …
</tabs>
```

### Layout of scroll-markers / tabs

- [[css-grid] Flow multiple elements together into same grid area][flow-items]
- [[css-grid] grid area as element][flow-element]
- [[css-grid] Decorative grid-cell pseudo-elements][style-area]

### Previous/next fragment navigation

Requirements:
- Options for next item or fragment?
- Generated or DOM-created or both?

## Key scenarios

[TBD]

## Detailed design discussion & alternatives

[TBD]

## Prior Art & Context

- [spicy-sections](https://daverupert.com/2021/10/native-html-tabs/)
  from OpenUI
- [`::scroll-marker` proposal](https://github.com/argyleink/ScrollSnapExplainers/tree/main/css-scroll-marker) from Una Kravets & Adam Argyle

## Stakeholder Feedback / Opposition

[TBD]

## References & Acknowledgements

Much of this work is based on
the research and proposals
compiled by others:

- Rachel Andrew
- Una Kravets
- Adam Argyle
- Brian Kardell,
  Dave Rupert,
  Jon Neal,
  Sarah Higley,
  Scott O'Hara,
  and others
  in the OpenUI Community Group.

{% note %}
- document snapping approach
- scroll markers are tabs (aria)
- focus groups
- gestures vs mouse (mouse fling?)
{% endnote %}
