---
title: CSS Responsive Components
created: 2020-11-09
index: rwd
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
