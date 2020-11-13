---
title: Responsive Components
eleventyNavigation:
  key: rwd
  title: Responsive Components
  parent: home
---

Currently `@media` queries give us a way to adjust a design
based on device features, user-preferences, and viewport size.
But modern web development relies heavily on modular
"blocks" and "components"
that can be moved around.

Authors want a way to style these components
based on more immediate context --
like the width of a parent container --
which might not match cleanly to viewport media.

Grid and flexbox both provide some tools
for managing available space,
so in addition to "container query" solutions,
I also want to think about if/where they can also be improved
for responsive design.

## Resources

- WICG: [Use Cases and Requirements](https://wicg.github.io/cq-usecases/)
- Chris Coyier: [Let's Not Forget About Container Queries](https://css-tricks.com/lets-not-forget-about-container-queries/)
- Chris Coyier: [Container Query Discussion](https://css-tricks.com/container-query-discussion/)
- Zach Leatherman: [The Origin Story of Container Queries](https://www.zachleat.com/web/origin-container-queries/)

## Proposals

These different directions are not exclusive --
a full solution for styling responsive components
will likely require multiple approaches.

{{ collections.all | eleventyNavigation('rwd') | eleventyNavigationToHtml | typogr | safe }}

## Comparing `switch()` & `@container`

I think **both of these are worth pusuing**,
because they come with a number of important trade-offs:

==TODO: Sort use-cases from WICG based on these two approaches==

### Ability to Implement

The `@container` syntax is surrently blocked
by a dependence on [single axis containment](../contain/),
which might be difficult or even impossible.

The `switch()` syntax already has working prototypes.

### Power vs Performance

The switch proposal avoids containment
by providing a very limited set of features
that will resolve after the browser-engine
has completed the layout pass:

- only query `available-inline-size` of the element itself
- apply that query to one property at a time
- only apply to properties that have no impact on size
- without any use of `calc()` or other math functions.

On the plus side,
that will be:

- Much easier to implement
- Much more performant

By depending on containment,
the `@container` proposal
would allow us to:

- query the context, not just the element
  (this is useful for adjusting the parts of a larger component)
- adjust any properties inside that context

### The Query Target

Container queries require an element that will be adjusted,
and a context that will be queried.

The `switch()` proposal allows you to (only)
_adjust the element that is being queried_.
The target of a switch query is the element itself.

My version of the `@container` proposal would query
_the nearest contained ancestor_
of any element that will be adjusted.
The target of the query is always a separate container
that the adjusted element is inside.

David Baron's proposal aims to allow
querying-and-adjusting a single element,
but it would require switch-like limitations
in order to work.

### Block vs Property Conditions

You can tihnk of them a bit like
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

## Hacks & Workarounds

These all work one-property-at-a-time,
much like the [`switch()` proposal](switch/)…

- Heydon Pickering: [Flexbox Holy Albatros](https://heydonworks.com/article/the-flexbox-holy-albatross/)
- Xiao Zhuo Jia: [Unholy Albatross](http://www.miragecraft.com/articles/unholy_albatross.html)
- Mathias Hülsbusch: [The Raven Technique](https://css-tricks.com/the-raven-technique-one-step-closer-to-container-queries/)
