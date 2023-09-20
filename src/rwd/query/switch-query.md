---
title: Comparing Switch & Container
created: 2020-11-14
changes:
  - time: 2021-03-16
    log: Flesh out the comparison details
permalink: /rwd/compare/switch-query/index.html
---

I began by pursuing both of these approaches,
since they have interesting trade-offs.

## Ability to Implement

The `@container` syntax is blocked
by a dependence on [single axis containment](/rwd/query/contain/),
but there is a plan to resolve that,
and a prototype underway at Google.

The `switch()` syntax has working prototype at Igalia.

## Summary

The switch proposal avoids containment
by providing a limited set of features
that will resolve after the browser-engine
has completed the layout pass.
That allows more flexibility for querying
"available space" in an abstract way --
but only on certain properties.

Currently that's handled inline,
one property at a time --
but more work could be done to explore
a block syntax that works within the limitations:

- query `available-inline-size` of the element itself
- only apply to properties that resolve during/after layout,
  and have no impact on size

The `@container` proposal
requires authors to define explicit "containers"
that are no longer able to size based on intrinsic values --
but provide a stable context for resolving queries.
That would allow us to:

- query the context, not just the element
  (this is useful for adjusting the parts of a larger component)
- adjust any properties inside that context

There are tradeoffs to either approach,
and they could work well in unison.

## The Query Target

Container queries require an element that will be adjusted,
and a context that will be queried.
The query target is always an element
that is extrinsically sized.

The `switch()` proposal allows you to
adjust properties of an element based on _its own dimensions_.
The target of a switch query is the element itself.

## Block vs Property Conditions

You can think of them a bit like
inline & block conditional statements
in other languages.
Sass, for example, has both:

```scss
@if <condition> {
  .example { /* block of rules when condition is met */ }
}

.example {
  grid-template: if(
    <condition>,
    1fr auto /* value when condition met */,
    auto /* default when condition is not met */
  );
}
```

A switch function can only change one property at a time,
while a container @-rule would allow more comprehensive changes.
Most languages provide both,
because either one can become bulky & painful
depending on the use-case.

## Use Cases

As far as I can tell,
there are a limited number of use-cases for `switch()`,
and _all the potential use-cases_ can be solved by `@container` --
though sometimes an additional element is required.

Here are a few uses that only `@container` can solve
(or solves much more easily):

- Show/hide elements based on a container size
- Adjust multiple properties based on a shared query
- Adjust multiple descendant elements based on a shared query

There are two potential advantages of `switch()`
in theory:

- There _might_ be cases where even 1D containment is too restrictive?
- Child elements in a grid/flex parent should respond to the "track" size
  rather than the parent size.

It's hard to comment on the first case.
So far I haven't had much trouble
using the early prototype of 1D containment --
but we still don't know exactly where things will land.

The second case is more clear,
and has been the basis of all `switch()` demos so far.
Consider the following HTML & CSS:

```html
<section class="card-grid">
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
</section>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20em, 1fr));
}

.card {
  display: grid;
  /* we want to change this value based on the track size */
  grid-template: "image" auto "content" 1fr "footer" auto / 100%;
}
```

The size of `.card-grid` does not
accurately reflect the available space for a given card,
but there is no other external "container"
that `.card` can use to adjust the `grid-template`.

Switch allows us to solve that on the `.card`,
without any extra elements:

```css
.card {
  display: grid;
  grid-template: switch(
    (available-inline-size > 40em) "image content" 1fr "footer footer" auto / auto 1fr;
    "image" auto "content" 1fr "footer" auto / 100%;
  );
}
```

Using `@container`,
we would need to add an extra wrapping element --
so that the card component has an external track-sized container to query:

```html
<section class="card-grid">
  <div class="card-container"><div class="card">...</div></div>
  <div class="card-container"><div class="card">...</div></div>
  <div class="card-container"><div class="card">...</div></div>
  <div class="card-container"><div class="card">...</div></div>
</section>
```

```css
/* the outer element can get containment… */
.card-container {
  contain: layout inline-size;
}

/* which gives .card something to query against */
@container (inline-size > 30em) {
  .card {
    grid-template: "image content" 1fr "image footer" auto / 1fr 3fr;
  }
}
```

The extra markup might not be ideal?
But on the other hand,
I'm not sure this single use-case
warrants a second approach?

## Other inline-conditions

There are various other discussions
about adding inline-conditional functions to CSS --
`if()`, `nth()`, `cond()`, etc.
Some of those proposals also allow
comparisons against `100%` as part of the condition statement.

In _most cases_
`100%` would be identical or similar to `available-inline-size`.
It might be interesting to see if one of these
more generic proposals
can be used to cover the `switch()` use-case.

## Learning & Teaching

While I see _potential_ advantages
in using `switch()` for a limited set of use-cases,
those advantages come down to it's behavior
being more _implicit_ --
which also makes it a bit harder to understand.

With `@container`:
- Authors define the container, and how it should work.
  That involves learning some new syntax
  to "contain" aspects of an element style.
- Authors have the choice to query either a wrapper
  on the component being adjusted,
  or a more structural and "external" layout ancestor.
- We query the resolved dimensions of the container element,
  which exists and can be inspected with dev tools.
- The syntax makes it clear that "containers"
  exist outside the elements being changed by a query.
- From there it works exactly like a media query,
  without any limits on which properties or how many
  can be changed in a single query

The primary point of confusion is likely
understanding which element is being queried in a given case
(maybe by marking "containers" in the DOM inspector)

With `@switch`:
- We query an abstract concept of "available space"
  which does not necessarily match the size of either
  the element in question or a parent element,
  and cannot (yet) be inspected.
- Only some properties can be changed by a switch,
  and after researching this...
  I still cant tell you exactly which ones.
- The syntax _looks like_ a function I could use anywhere.
- The syntax is new and complicated,
  all for changing a single property

I expect confusion around what is being queried,
what those queries can be applied to,
and (in both cases) _why_?
