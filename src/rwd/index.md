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
- CSS Tricks: [Container Query Discussion](https://css-tricks.com/container-query-discussion/)
- Zach Leatherman: [The Origin Story of Container Queries](https://www.zachleat.com/web/origin-container-queries/)

## In Progress

These different directions are not exclusive --
a full solution for styling responsive components
will likely require multiple approaches.

{{ collections.all | eleventyNavigation('rwd') | eleventyNavigationToHtml | safe }}
