# Container Style Query Explainer

<!-- generate TOC using VSCode Markdown All-In-One extension -->
- [Authors](#authors)
- [Participate](#participate)
- [Introduction](#introduction)
- [Goals](#goals)
- [Non-goals](#non-goals)
- [Proposed Solutions](#proposed-solutions)
- [Key scenarios](#key-scenarios)
- [Detailed design discussion & alternatives](#detailed-design-discussion--alternatives)
- [Stakeholder Feedback / Opposition](#stakeholder-feedback--opposition)
- [References & acknowledgements](#references--acknowledgements)

## Authors

- Miriam Suzanne

## Participate

Initial CSSWG issues:

- [What container features can be queried? #5989](https://github.com/w3c/csswg-drafts/issues/5989)
- [Define a syntax for style-based container queries #6396](https://github.com/w3c/csswg-drafts/issues/6396)

Currently open CSSWG issues:

- [Should style() queries allow !important flag? #7413](https://github.com/w3c/csswg-drafts/issues/7413)
- [Move style queries of standard properties to level 4 #7185](https://github.com/w3c/csswg-drafts/issues/7185)

Related CSSWG issues:

- [Higher level custom properties that control multiple declarations #5624](https://github.com/w3c/csswg-drafts/issues/5624)
- [Define a syntax for state-based container queries #6402](https://github.com/w3c/csswg-drafts/issues/6402)

## Introduction

Container queries
allow authors to 'query'
some set of conditions on an ancestor element,
in the same ways that media queries
allow us to query various conditions
of the overall viewport, browser, and interface.

Also similar to media queries,
the majority of discussion
has historically focussed on
[size-based queries](https://css.oddbird.net/rwd/query/explainer/) —
especially the width of the viewport or container.
But much like
device-interface and user-preference media queries,
there are a number of other powerful
'container features' that
would be useful to query.
We've categorized these roughly
into two types:

1. [Style features](https://github.com/w3c/csswg-drafts/issues/6396)
   (already specified in
   [CSS Containment Level 3](https://www.w3.org/TR/css-contain-3/#style-container))
   allow querying
   the _computed styles_ of a container.
2. [State features](https://github.com/w3c/csswg-drafts/issues/6402)
   would allow querying various aspects of
   the container's current state —
   such as a `position:sticky` container
   being currently 'stuck',
   or an `overflow:auto` container
   currently 'overflowing'.
   These feature would likely need to be defined
   one-at-a-time, and require more research.

This document is an explainer of
container query style features.

## Goals


## Non-goals


## Proposed Solutions

The Container Query syntax
already provides
many of the requirements
for making style queries possible:

- The existing `@container` rule
  is already established as a way
  of querying conditions on specific ancestor elements.
- The existing `container-name` syntax
  allows more explicit targeting of queries,
  important for querying non-inherited properties.
- Enforcing a separation between
  the elements being styled
  and the 'container' being queried
  helps avoid potential style loops.



## Key scenarios


## Detailed design discussion & alternatives



## Stakeholder Feedback / Opposition

- Chromium : Positive --
  Google was involved in developing this proposal
- Gecko : Positive --
  Mozilla developed the original proposal this is based on
- Webkit : No signals

## References & acknowledgements

