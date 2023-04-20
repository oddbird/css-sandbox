---
draft: 2023-04-17
title: Overflow Extensions Proposal & Explainer [partial draft]
eleventyNavigation:
  key: overflow-explainer
  title: Proposal & Explainer [partial draft]
  parent: overflow
---

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
from scrolling to accordions,
tabs, slideshows, carousels,
and so on.
The lines between these patterns
are often somewhat blurry:

- A slideshow is one kind of carousel
- A carousel can often be scrolled and snapped into position
- Carousel with 'markers' for each view
  are similar to tabs
- An accordion behaves similar to deconstructed tabs

While there's a lot of important minutia
that can get lost in such a simplified list,
the essential similarity
is that all these patterns involve
more control and careful management of 'overflow'
beyond simple scrolling.

## Goals

The goal of this proposal
is not to provide a one-size-fits-all solution
for all overflowing UI,
but to consider some baseline improvements to CSS overflow
that could help authors
flesh out the details of each pattern more elegantly,
consistently, and accessibly.

### Overlapping patterns

The terms 'carousel' and 'tabs'
are not clearly distinct in practice,
but fall along a continuum
of paged overflow.

- On one end,
  media-scroller carousels
  (like the Netflix video selection interface)
  are similar to horizontal overflow
  with scroll-snapping,
  and the occasional use of 'next/previous'
  page-scrolling navigation.
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
  is often removed,
  relying entirely on navigation controls
  and (sometimes) touch-gesture based scrolling.
- Tabs take that pattern even further,
  often using header-like text for the scroll-markers,
  enforcing the single-item-at-a-time view,
  and often removing scroll-controls entirely.

Rather than thinking of these
as distinct patterns,
we want to understand the underlying set of controls
that are combined to create
any given variation of the interface.

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
and different types of 'overflow' always require
different interactions.
Any solutions provided here
have to account for changes in overflow
based on context --
and help authors access the proper interactions
and accessible roles
for each type of overflow.

## Non-goals

### Application-Level Tabs

The 'tabs' interface pattern
has two common use-cases:

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

### Auto-advancing Carousels

The term 'carousel'
has a strong negative connotation
in some circles,
thanks to the poor user-experience
of auto-advancing carousels
often used on home pages
to display 'recent' or 'featured' content.

In this use-case,
users rarely interact with the pattern,
and generally don't see content
beyond the first page of the carousel.
While they can be forced
to see additional pages
via auto-advancement,
it is very hard to interact with content
that moves and changes unexpectedly.

### Virtual lists & cyclic scrolling

[defer for later]

## Proposed Solutions

Rather than providing a single unified solution,
we think there are a variety of
improvements that can be made
to CSS overflow and layout
which would help authors
better address the specific needs of their content.

### Generating `::scroll-marker`s

Requirements:
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
carousel:fragment::scroll-marker {
  grid-area: markers;
  content: '';
  background: element();
}
```

### Semantic item scroll-markers / tabs

Requirements:
- An attribute (or property?) for assigning scroll-marker behavior.
- A way to 'hoist' the element into a parent grid context
  (see layout )

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

Requirements
- [[css-grid] Flow multiple elements together into same grid area][flow-items]
- [[css-grid] grid area as element][flow-element]
- [[css-grid] Decorative grid-cell pseudo-elements][style-area]

### Previous/next fragment navigation

Requirements:
- Options for next item or fragment?
- Generated or DOM-created or both?

### Styling an overflow `:fragment()`

[do we need this?]

## Key scenarios

[TBD]

## Detailed design discussion & alternatives

[TBD]

## Prior Art & Context

- [`::scroll-marker` proposal](https://github.com/argyleink/ScrollSnapExplainers/tree/main/css-scroll-marker) from Una Kravets

## Stakeholder Feedback / Opposition

[TBD]

## References & Acknowledgements

Much of this work is based on
the research and proposals
compiled by others:

- Una Kravets
- Adam Argyle
- Brian Kardell,
  Dave Rupert,
  Jon Neal,
  Sarah Higley,
  Scott O'Hara,
  and others
  in the OpenUI Community Group.
