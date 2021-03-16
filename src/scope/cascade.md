---
title: Scope in the Cascade
eleventyNavigation:
  key: scope-cascade
  title: In the Cascade
  parent: scope
---

There are two primary ways to think about "scope" in CSS,
which represent different goals.

1. Keep scoped styles **from escaping scope** --
   by expressing a scope of _ownership_
   through root & lower-boundary selectors.
2. Keep global styles **from overriding scope** --
   by giving _proximity_ the power to override
   specificity in the cascade.

Most CSS tooling (CSS modules, Vue scoped styles, etc)
have put their entire focus on the first goal,
but previous CSS proposals have been designed to do both --
making scope much more "heavy-handed" in the Cascade.

My thesis has been
that giving _proximity_ too much power
to override global scope
would make this feature too limited in use-cases --
and be a major departure from the tools
authors already use.
This document is an attempt to flesh out that argument.

## Scope in existing tools

The primary solution I've seen
was invented (if I understand correctly)
by [CSS Modules][modules],
and adapted by other tools.
Using JavaScript as a preprocessor
for both the CSS & HTML output,
classes are transformed to
make selectors unique within a scope:

```html
<!-- input html -->
<h1 css-module="title">postcss-modules</h1>

<!-- output html -->
<h1 class="_title_xkpkl_5">postcss-modules</h1>
```

```css
/* input CSS */
:global(.title) { /* specificity [0,1,0] */
  color: red;
}

:local(.title) { /* specificity [0,1,0] */
  color: green;
}

/* output CSS */
.title { /* specificity [0,1,0] */
  color: red;
}
._title_xkpkl_5 { /* specificity [0,1,0] */
  color: green;
}
```

When complex selectors are used,
each selector part is transformed individually.

The result is:

- Ownership is established through unique identifiers --
  (avoid styles leaking out)
- No change to specificity
- No change to internal vs external (proximity) priority
- No impact on priority of global vs local styles

Vue scoped styles adapt this approach,
but use an _additional_ unique attribute
rather than transforming the original attributes:

```html
<!-- input html -->
<h1 class="title">postcss-modules</h1>

<!-- output html -->
<h1 class="title" data-xkpkl>postcss-modules</h1>
```

```css
/* global CSS */
.title { /* specificity [0,1,0] */
  color: red;
}

/* scoped CSS */
.title { /* specificity [0,1,0] */
  color: green;
}

/* output CSS */
.title { /* specificity [0,1,0] */
  color: red;
}
.title[data-xkpkl] { /* specificity [0,2,0] */
  color: green;
}
```

- Ownership is established through unique attributes --
  (avoid styles leaking out)
- Specificity is increased by a single attribute
- No change to internal vs external (proximity) priority
- Global styles need additional attribute specificity (minimum)
  in order to override scoped styles

These tools also tend to…

- Create non-overlapping (or minimally-overlapping) scopes
- Encourage scoping all component styles
- Output global styles first in the source order

The result is that scoped styles _generally_
override global styles of the same specificity,
but it is easy to increase global specificity when desired
to override scoped styles.

## My existing proposal

My proposal would be able to replicate either/both outcomes --
or provide their own desired specificity behavior --
by allowing the author to establish a "scope specificity"
in addition to the "selector specificity"
of each selector block:

```css
.title { color: red; } /* specificity [0,1,0] */
.title.special { color: purple; } /* specificity [0,1,0] */

@scope (:where(.article)) to (.lower-bounds) {
  .title { /* specificity [0,1,0] */
    color: green;
  }
}
@scope (.article) to (.lower-bounds) {
  .title { /* specificity [0,2,0] */
    color: green;
  }
}
@scope (#article) to (.lower-bounds) {
  .title { /* specificity [1,1,0] */
    color: green;
  }
}
```

Additionally,
I would give priority to scope proximity
_when specificity is equal_.
In this example,
the global `.title.special`
would be able to override the first (zero-specificity-root) scope.

- Ownership is established through lower-boundary selectors --
  (avoid styles leaking out)
- Specificity is controlled by the author
- Internal scope gets priority _when specificity is equal_
- Global styles _may_ need additional specificity
  to override scoped styles

## Migration path

All existing tools would be able to auto-generate
`@scope` rules that match their current behavior
in terms of both _ownership_
(lower-boundaries replace unique attributes)
& _specificity_
(by generating an appropriate root selector).

The only difference would be
that scoped styles are given a slight bump in priority
_when specificity is equal_.

That would take the existing "most common" behavior,
and give it more reliable consistency,
without dramatically changing the implications.
While we continue relying on specificity,
we no longer rely on source-order.

For authors that are migrating by hand,
classes and attributes make up the vast majority of selectors,
and the most common results will be similar to Vue:
a root specificity of `[0,1,0]`
added to the specificity of individual selectors.

Since that also matches the specificity behavior of nesting,
I expect it to be an easy concept to learn & teach.

## Use Cases

Inner scopes should not override outer states.
Said more generically,
scoped styles should be able to
update a _default_ pattern
without overriding all the global _variations_
of that pattern.

==@@@ work in progress==

