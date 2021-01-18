---
title: Comparing Switch & Container
eleventyNavigation:
  key: switch-container
  title: Comparing Switch & Container
  parent: rwd
---

I think **both of these are worth pursuing**,
because they come with a number of important trade-offs:

### Ability to Implement

The `@container` syntax is blocked
by a dependence on [single axis containment](/rwd/query/contain/),
but there is a prototype of both underway.

The `switch()` syntax already has working prototypes.

### Summary

The switch proposal avoids containment
by providing a limited set of features
that will resolve after the browser-engine
has completed the layout pass.
That allows more flexibility for querying
"available space" in a more abstract way --
but only on certain properties.

Currently that's handled inline,
one property at a time --
but more work could be done to explore
a block syntax that works within the limitations:

- query `available-inline-size` (and others?) the element itself
- only apply to properties that have no impact on size (many of them!)

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

### The Query Target

Container queries require an element that will be adjusted,
and a context that will be queried.
The query target is always an element
that is extrinsically sized.

The `switch()` proposal allows you to
adjust properties of an element based on _its own dimensions_.
The target of a switch query is the element itself.

### Block vs Property Conditions

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
