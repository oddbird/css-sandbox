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
.title.special { color: purple; } /* specificity [0,2,0] */

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

The current design of this feature
is based on the premise that
**scoped defaults should not override global specifics**,
and that in-fact
**different scopes have different purpose & priority**.
There is no reason to assume
all scoped styles with a _default_ link color
should override all the global patterns
with link color _variations_.

In order to make scope higher-priority than specificity,
we have to assume that:

- namespaced styles (scoped so as not to apply too broadly)
  _also/always_ represent more specific styling
- specificity isn't the right solution for that

I'm arguing that's not a fair assumption,
and scope is more flexible/useful
when it does not imply priority.

### Button defaults & patterns

For a simplified example,
let's assume we have a global pattern
for different button types:

```css
button {
  padding: 0 0.5em;
  background: blue;
  color: white;
}

button.danger {
  background: maroon;
}
```

If we've scoped those globally,
it's probably because we plan to use them
across the entire site,
in a variety of contexts.

Now let's say we want to change the default
in a specific scope:

```css
@scope (aside) {
  button {
    background: purple;
  }
}
```

It does make sense to me that the more scoped style
overrides the default,
with either equal or higher specificity.
But I do not think it's obvious
that this should _also_ override my
global `button.danger` pattern
in the `aside`.

If scope overrides specificity,
our only recourse here would be layers:

```css
@layer buttons.default {
  button {
    padding: 0 0.5em;
    background: blue;
    color: white;
  }
}

@layer buttons.type {
  .danger {
    background: maroon;
  }
}

@scope (aside) {
  @layer buttons.default {
    button {
      background: purple;
    }
  }
}
```

That's not a bad solution,
and works in both cases if we want it,
but I don't find it obvious
that scope should imply priority over specificity
in cases like this --
and the current proposal would allow
various other logics for defining priority:

- scopes can be given different specificities
  or layers to clarify their importance
- scopes can be given similar specificity
  when we want inner-takes-precedence

### Inverted sidebar

Fantasai raised this use-case the CSSWG telecon:

> fantasai: Example: I have a sidebar in my page
> and want it to have a different color.
> Inverse contrast color.
> I have rules setting link color heading color etc.
> Need to override them all in my sidebar.
> I override the link and say it's light.
> Overall outer page has
> slightly different colors for links in a list.
> B/c that's higher specificity it overrides the sidebar.

I implemented this in codepen,
and it is possible to re-create the scenario:

<p class="codepen" data-height="363" data-theme-id="39098" data-default-tab="css,result" data-user="mirisuzanne" data-slug-hash="1235d3af7fd584d4f9471b90735a38ec" style="height: 363px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="1235d3af7fd584d4f9471b90735a38ec">
  <span>See the Pen <a href="https://codepen.io/mirisuzanne/pen/1235d3af7fd584d4f9471b90735a38ec">
  1235d3af7fd584d4f9471b90735a38ec</a> by Miriam Suzanne (<a href="https://codepen.io/mirisuzanne">@mirisuzanne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

But it took some work to make
the specificity of a global link-in-a-list style to
override the specificity of a "scoped" link-in-a-sidebar.
Either my scoping selector has to be surprisingly weak,
or my global style has to be fairly specific.

Fantasai also says:

> If you switch class to ID
> it can completely destroy relationship between selectors.

I'd argue _that's exactly the purpose of specificity_,
and would be the _expected behavior_ we're used-to,
and there's no reason for `@scope` to change any of that.

If we had a dark-mode style
and a light-mode style,
I would expect them to get similar weight.
In that case we clearly want the inner style to win.
When the specificities differ,
it is much less clear to me.
If I create a highly-specific style to be applied globally,
why would we assume
that lower-specificity scoped styles should take precedence?
I wouldn't want that.

To me this is exactly the argument
in favor of specificity winning over scope.
**If the `link-list` pattern is supposed to have a special link styles,
then that pattern should own all its contextual variations,
and not get wiped out by generic styles
just because they happen to be scoped.**

In this case,
the author needs to clarify their intentions,
and the current proposal gives them lots of options:

- If we're talking about a low-priority link-in-list pattern...
  - That probably shouldn't have a high specificity
  - If it needs higher specificity for some reason,
    it could go in a lower "defaults" layer
- If our sidebar is special,
  and really should override global patterns...
  - We probably want to clarify that with more specificity
  - Or put it in a "components" layer
    above a "defaults" layer
- If link-lists should get custom styles in any context,
  we should define both variants of the pattern...
  - Clearer selectors will likely result in equal specificity,
    or even higher specificity in the more specific context
  - We could use a contextually set custom property,
    which would inherit from the more narrow context
- If we want to ignore `link-list` colors inside a sidebar...
  - Then we can scope the `link-list` class with a lower boundary

All of these solutions help to clarify what we meant,
and what we intended.
None of them are hacks.

## Conclusion

My argument is not that specificity conflicts never occur across scope,
but that specificity & layers already provide appropriate solutions,
and we don't need scope to override them by default.
Instead scope adds the ability to:

- Avoid selectors escaping their context, through lower boundaries
- Ensure that similar-weight patterns respect proximity

In my mind,
the purpose of global scope is
_explicitly to apply everywhere_,
and the purpose of a narrower scope is
_to constrain where some styles apply_.
The argument for strong scope assumes that goal
(constraint) _always aligns_ with a desire
to write a "more specific" style,
that should override the global,
(even without a more specific selector).

I don't understand that assumption.

While there are _some cases_ where we want both,
we already have specificity tools, and layering for that.
But if we insist these goals always go together,
we end up making it very hard
in the cases where they don't.
