---
title: CSS Toggles Explainer & Proposal
created: 2022-02-28
eleventyNavigation:
  key: toggles-explainer
  title: CSS Toggles Explainer
  parent: toggles
warn: |
  This explainer is an incomplete draft,
  still under active development.
---

## Authors

- Explainer by Miriam Suzanne
- Draft specification by Miriam and Tab Atkins Jr.
- See the [References & Acknowledgements](#references--acknowledgements)
  for additional contributors and prior art

## Participate

- [Unofficial draft specification](https://tabatkins.github.io/css-toggle/)
- [Github issues for draft spec](https://github.com/tabatkins/css-toggle)
- [CSSWG tracking issue](https://github.com/w3c/csswg-drafts/issues/6991)

## Introduction

There are many use-cases
where an interaction (click/gesture) on one element
toggles a 'state' that can be shared with other elements.
This can range from toggling light/dark mode,
to activating slide-in navigation,
opening and closing menus,
or interacting with sectioned content
as tabs, accordions, or carousels.
HTML also provides the `<input type=checkbox>` element,
with a "checked" state that toggles between `true` and `false`
when the user activates the element,
and which can be selected by the `:checked` pseudoclass.

These cases currently require custom Javascript,
which adds a barrier for authors otherwise capable
of implementing the visual design --
and often results in less performant,
less accessible solutions.

We propose generalizing the pattern
so that it can be applied to any element
using a declarative syntax in CSS,
with built-in accessibility and performance.

## Goals [or Motivating Use Cases, or Scenarios]

Several of the expected use-cases
involve showing and hiding content
based on the state of a toggle:

- tabs
- accordions / tree views
- carousels
- popups
- dialogs
- summary/details
- off-canvas menus

However, there are also use-cases
for a toggle to have less invasive impact:

- light/dark/high-contrast/auto color themes
- adjusting font sizes
- compact/comfortable spacing
- calendar/agenda view

The [Open UI](https://open-ui.org/) project
has been working on new elements/attributes
that could help with some of these use-cases
at a high level --
such as section lists ('spicy sections')
and popups.
It's our goal that CSS toggles provide
some shared functionality
that those elements & attributes can rely on,
while also giving authors access
to define new toggle-based patterns.

Along the way,
we have a few goals for
_how this feature should work_:

- Accessibility should be baked in by default,
  rather than relying on author intervention
- Relationships between a trigger and its impact
  should be established and accessed in CSS,
  rather than relying on unique IDs or selectors-as-property-values.
- JS should not be required in the most common use-cases

## Non-goals

Toggling in CSS will need to integrate smoothly
with other important features
that are being discussed,
such as:

- 'Focus groups' would allow grouping multiple toggle-triggers
  in a single tab-stop for keyboard interaction
- 'Gestures' could expand what it means to interact with a toggle-trigger

While we need to keep these integrations in mind,
along with the HTML features being developed in Open UI --
this proposal is focused on the specifics
of setting/managing toggle states in CSS.

## Proposal for declarative CSS toggles

### Broad overview

This proposal relies on several primary concepts.
First off the toggles themselves:

- Every **toggle** has a name, a current state,
  set number of possible states,
  and some metadata for determining how to move between states
  (e.g. cycling vs linear).
- Any element can become a **toggle root**
  for any number of toggles,
  using the `toggle-root` property.

Once we have toggles,
we need a way to access them --
both for the sake of _changing_ state,
and also in order to _use_ that state somehow.
A toggle is 'visible' to its root element
and any descendants (similar to inheritance),
as well as (optionally) siblings and the descendants of siblings
(similar to the css counters).

Any element that can 'see' and access a given toggle:

- Can become a **trigger** for that toggle
  using the `toggle-trigger` property,
  such that interactions on the trigger element
  update the state of the toggle.
- Can use the `:toggle()` pseudo-class
  to select based on the current state of the toggle

Toggles can also be grouped together
using the `toggle-group` property --
in which case only one toggle from the group
can be 'active' at a time.
This is similar to how radio inputs work in HTML.

{% note %}Toggle groups are not the same
as 'focus groups' proposed elsewhere.
The former impacts how _multiple toggles_ relate
(one active at a time),
while the latter allows _multiple triggers_
to be grouped in the tab order
(one tab-stop for all interactions).
Existing HTML radio input behavior
would require both features --
grouping both the trigger focus and states.{% endnote %}

In order to avoid circular logic,
toggles are persistent and (once created)
their state cannot be changed from CSS directly.

### The anatomy of a toggle

Each toggle has a number of characteristics:

- **name**:
  a custom identifier used to reference the toggle
- **state**:
  a non-negative integer from `0` (inactive)
  through any number of active states (`1` or higher)
- **state names**:
  a list of custom identifiers for the possible states
- **group**:
  a boolean indicator if the toggle is part of a toggle-group
  (using the same toggle name)
- **scope**:
  a keyword specifying how broadly the toggle can be 'seen':
  - `narrow` (only visible to descendants)
  - `wide` (also visible to siblings & sibling descendants)

## Key scenarios

## Detailed Design Discussion

## Considered Alternatives

## Stakeholder Feedback / Opposition

## References & Acknowledgements

This proposal was heavily influenced
by the 'Declarative Show/Hide' work of
Robert Flack, Nicole Sullivan, and others:

- [Declarative show-hide repo](https://github.com/flackr/declarative-show-hide)
- [Declarative show-hide doc](https://docs.google.com/document/d/1HcQ75iRhO-dT7EHB6JrjmMATa9XlSCYZKWrXbzakexQ/edit?resourcekey=0-kYHpL3r3jY3Q8wtTaOa6aA#)

There is also a previous draft spec
written by Tab Atkins Jr.:

- [CSS Toggle States](https://tabatkins.github.io/specs/css-toggle-states/)
