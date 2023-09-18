---
title: Scope & Encapsulation
created: 2020-11-10
changes:
  - time: 2021-09-11
    log: Scope spec draft moved to Cascade-6
index: scope
links:
  spec: css-cascade-6
  project: 21
  caniuse: css-cascade-scope
---

Authors often complain that CSS is "globally scoped" --
so that every selector is compared against every DOM element.

There are several overlapping concerns here,
based on a wide range of use-cases --
and they can quickly become confused.
That has lead to a wide array of proposals
that are sometimes working towards different goals.

Both shadow-DOM
and the abandoned "scope" specification
were focused around strong isolation.
Shadow-DOM in particular creates persistent DOM-defined boundaries,
that impact all style rules.

Meanwhile,
most of the user-land "scope" tools for CSS
have a much lighter touch.
I've been mainly interested in those low-isolation,
namespacing problems.
