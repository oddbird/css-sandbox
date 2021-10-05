---
title: Brooklyn CSS
created: 2021-10-05
eleventyNavigation:
  key: 2021-brooklyn
  title: Brooklyn CSS
  parent: elsewhere
---

I spent a week in Brooklyn,
working with fantasai and Jen Simmons
on a range of ideas and proposals
for the future of CSS.
Most of those notes are documented elsewhere,
but I wanted to collate here
what we covered in that time.

## Agenda

- ✅ Cascade-6 Scoping
- ✅ Interpolation between breakpoints
- ✅ Rethink scroll timeline
- ✅ Margin-trim
- ✅ Container size & style queries
- ✅ CSS nesting
- ✅ css-grid-3 triage
- ✅ css-text-4 triage
- ✅ css-values-4 triage
- ✅ Flexible container name/type syntax
- ➡️ File a proposal for `minmax-span()`
- ➡️ `vw` units causing overflow/scrollbars
- ➡️ File an issue about containment interaction with subgrid
- ➡️ Define nested scopes
- ➡️ Responsive Tables
- ➡️ Additive Cascade
- ➡️ Text-decoration triage
- ➡️ URL modifiers (preload, lazyload, cross-origin)
- ➡️ Sibling and index counters

## Implementor notes

There are a few high-priority features
that we think need to be addressed:

- Box alignment in block context
- Font-variant longhand values
- Colors 4&5 functions & color-spaces
- Get youtube to embed aspect ratios?
- `inherit()` function (https://github.com/w3c/csswg-drafts/issues/2864)

## Proposals, issues, and specifications

### Flow-relative syntax

The goal is to make it possible
for authors to write CSS
with "logical" (flow-relative) values
as a first-class default option --
combined with or replacing
"physical" (<abbr title="Top Right Bottom Left">trbl</abbr>) values.
This would require a multi-year process.

Proposal:
- [Logical (Flow-relative) Syntax](https://wiki.csswg.org/ideas/logical-syntax)

### Margin Trim

Proposal:
- [Margin Collapse Controls](https://wiki.csswg.org/ideas/margin-collapsing)

Issues:
- [Should margin-trim apply to flex or grid containers? #3255](https://github.com/w3c/csswg-drafts/issues/3255#issuecomment-923262633)
  (accepted by csswg)
- [Should margin-trim have a 'floats' value? #3256](https://github.com/w3c/csswg-drafts/issues/3256#issuecomment-923265086)
- [Switch margin-trim to boolean indicating sides rather than types of boxes to trim #6643](https://github.com/w3c/csswg-drafts/issues/6643)
  (accepted by csswg)

### Grid/flex/mulicol:

Proposals:
- [Column and Row Gaps and Rules](https://wiki.csswg.org/ideas/gutter-styling)
- [Decorative grid-cell pseudo-elements #499](https://github.com/w3c/csswg-drafts/issues/499#issuecomment-926122734)
  (assigned to Jen Simmons & Rachel Andrew for specification)

Issues:
- [Styling Gaps/Gutters #2748](https://github.com/w3c/csswg-drafts/issues/2748#issuecomment-932626908)
- [image support for column rules #5080](https://github.com/w3c/csswg-drafts/issues/5080#issuecomment-932625867)

### Timelines & interpolation

Proposal:
- [Timelines and Interpolation](https://wiki.csswg.org/ideas/timelines)

Spec Change:
- [Add generic interpolation function](https://github.com/w3c/csswg-drafts/commit/05ba5157df6f88fa6ca2cd4bab04a17b8f773ed8)

Issues:
- [Rethinking declarative syntax for scroll-linked animations #6674](https://github.com/w3c/csswg-drafts/issues/6674)
- [Interpolate values between breakpoints #6245](https://github.com/w3c/csswg-drafts/issues/6245#issuecomment-926351855)
- [Native interpolation function in CSS #581](https://github.com/w3c/csswg-drafts/issues/581#issuecomment-926353789)
- [Need method to interpolate variable font settings #5635](https://github.com/w3c/csswg-drafts/issues/5635#event-5390650750)
  (triage)

### Nesting

- [Syntax suggestion #4748](https://github.com/w3c/csswg-drafts/issues/4748#issuecomment-924118287)

### Container Queries

Spec Change:
- [Incorporate style queries](https://github.com/w3c/csswg-drafts/commit/f209f6a01a65a210acf100db9036dcccdc2c0baa)
- [Clarify user-defined tokens in examples](https://github.com/w3c/csswg-drafts/commit/97c2782ffec0009d2d8fe5f465cb44ad5f9a92e0)

Issues:
- [Define a syntax for style-based container queries #6396](https://github.com/w3c/csswg-drafts/issues/6396#issuecomment-923602244)

### Scope

Spec Change:
- [Incorporate ideas from this week's discussions between fantasai and Miriam](https://github.com/w3c/csswg-drafts/commit/cc730fbcd1fe8737da2a0e96319994c50e0f61f6)
