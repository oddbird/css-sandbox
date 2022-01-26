---
title: Draft Outline for an (In)Complete Guide
created: 2022-01-14
changes:
  - time: 2022-01-21T17:02:21-07:00
    log: Begin to flesh out use-cases and browser support
  - time: 2022-01-26T15:32:20-07:00
    log: Reorganize outline, draft intro and first use-case
eleventyNavigation:
  key: guide
  title: Draft Outline for an (In)Complete Guide
  parent: layers
warn: false
note: |
  This is a draft document,
  working towards a more complete guide
  that can be published elsewhere.
---

## Introduction: What (and why) are Cascade Layers?

### The Problem: Specificity conflicts escalate

Many of us have been in situations
where we want to override styles
from elsewhere in our code
(or a third-party tool),
due to conflicting selectors.
And over the years,
authors have developed a number of
'methodologies' and 'best practices' to avoid these situations --
such as 'only using a single class' for all selectors.
These rules are usually more about avoiding the cascade,
rather than [putting it to use](https://css-tricks.com/dont-fight-the-cascade-control-it/).

Managing cascade conflicts and selector specificity
has often been considered one of the harder --
or at least more confusing --
aspects of CSS.
That may be partly because
few other languages
rely on a cascade as their central feature,
but it's also true that the original cascade
relies heavily on _heuristics_
(an educated-guess or assumption built into the code)
rather than providing direct & explicit control
to web authors.

_Selector specificity_, for example --
our primary interaction with the cascade --
is based on the assumption
that more narrowly targeted styles
(like IDs that are only used once)
are likely more important than more generic & reusable styles
(like classes and attributes).
That is to say: how _specific_ the selector is.
That's a good guess,
but it's not a totally reliable rule,
and that causes some issues:

- It conflates the act of _selecting elements_,
  with the act of _prioritizing rule-sets_.
- The simplest way to 'fix' a conflict with specificity
  is to escalate the problem by adding
  otherwise unnecessary selectors,
  or (gasp) throwing the `!important` hand-grenade.

### The Solution: Cascade Layers provide control

Cascade Layers give CSS authors
more direct control over the cascade,
so we can build more
_intentionally cascading systems_,
without relying as much on heuristic assumptions
that are tied to selection.

Using the `@layer` rule and layered `@import`s,
we can establish our own
_layers of the cascade_ --
building from low-priority styles
like resets and defaults,
through themes, frameworks, and design systems,
up to highest-priority styles like
components, utilities, and overrides.
Specificity is still applied to conflicts _within each layer_,
but conflicts between layers are always resolved
by using the higher-priority layer styles.

These layers are ordered and grouped,
so that they don't _escalate_
in the same way that specificity and importance can.
Cascade Layers aren't cumulative like selectors.
Adding more layers doesn't make something more important.
They're also not binary like importance --
suddenly jumping to the top of a stack --
or numbered like `z-index`,
where we have to guess a big number (`9999999`?).
In fact, by default,
layered styles are _less important_ than unlayered styles.

### Where do layers fit in the Cascade?

Since multiple selectors can apply styles
to the same element,
it's easy to end up with conflicting styles:

```html
<button class='warning'>tread lightly, gumshoe</button>
```

```css
button {
  background-color: rebeccapurple;
}

.warning {
  background-color: maroon;
}
```

Our poor `button` element must have exactly one `background-color`,
so The Cascade exists to help browsers resolve those conflicts,
and select the _highest priority_ background to apply.
In this case, the cascade would select the `maroon` styles,
because a 'class' has higher _specificity_ than a 'tag' name.

But specificity is only one part of a much larger cascade,
and as web projects become more complex,
it becomes more and more essential
for CSS authors to _understand_ how it works,
and also _take control_ of how their styles participate.

==todo==

### Establishing a layer order

==todo==

How layers stack, in the order they're mentioned.

### Layers and `!important`

==todo==

Important layers are reversed!

## The Syntax: Working with Cascade Layers

### Order-setting `@layer` statements

==todo==

Best practice: establish the order up-front.

### Block `@layer` rules

==todo==

```css
@layer <name> {
  /* styles added to the layer */
}
```

### Grouping (nesting) layers

==todo==

```css
@layer <name-1> {
  /* styles added to the <name-1> layer */

  @layer <name-2> {
    /* styles added to the <name-1>.<name-2> layer */
  }
}

@layer <name-1>.<name-2> {
  /* styles also added to the <name-1>.<name-2> layer */
}
```

### Adding layers to `@import`ed styles

==todo==

```css
/* styles imported into to the <layer-name> layer */
@import url('../example.css') layer(<layer-name>);
```

### Anonymous (unnamed) Layers

==todo==

```css
@layer {
  /* styles added to a new anonymous layer */
}
```

```css
/* styles imported into to a new anonymous layer */
@import url('../example.css') layer;
```

### Reverting layers

==todo==

The `revert-layer` keyword.

## Use cases: When would I want to use cascade layers?

### Less intrusive resets and defaults

One of the clearest initial use-cases
would be to make low-priority defaults
that are easy to override.

Some resets have been doing this already
by applying the `:when()` pseudo-class
around each selector.
That removes all specificity from the selectors,
which has the basic impact desired,
but also some downsides:

- It has to be applied to each selector individually
- Conflicts inside the reset have to be resolved without specificity

Layers allow us to more simply wrap
the entire reset stylesheet,
either using the block `@layer` rule:

```css
/* reset.css */
@layer reset {
  /* all reset styles in here */
}
```

Or when you import the reset:

```css
/* reset.css */
@import url(reset.css) layer(reset);
```

**Note**: Or both!
Layers can be nested,
without changing their priority --
so you can use a third-party reset,
and ensure it gets added to the layer you want
whether or not the reset stylesheet itself
is written using layers internally.

Since layered styles have a lower priority
than default 'unlayered' styles,
this is a good way to start using Cascade Layers
without re-writing your entire code-base.

The reset selectors still have specificity information
to help resolve internal conflicts,
without wrapping each individual selector --
but you also get the desired outcome
of a reset stylesheet that is easy to override.

### Using third-party tools and frameworks

==todo==

Make sure you control bootstrap,
and it doesn't control you!

### Managing a complex CSS architecture (across projects & teams?)

==todo==

Implement a system like ITCSS
at scale,
using native browser features.

### Designing a CSS tool or framework

==todo==

Frameworks can choose to expose or hide
layers as part of their API

### ❓ I just want this one property to be more `!important`

==todo==

It depends,
but maybe that's the job of
`!important`?

### ❌ Scoping and namespacing styles? Nope!

==todo==

[Recent twitter post](https://twitter.com/TerribleMia/status/1483171004235059202)

## Examples: which style wins?

==todo==

Give various examples,
and show which style wins in each situation.

## Debugging layer conflicts in browser developer tools

==todo==

We'll have to see what this looks like
in various browsers...

## Browser support and fallbacks

Cascade layers are (or will soon be) available by default
in all the three major browser engines:

- Chrome/Edge 99+
- Firefox 97+
- Safari (currently in the Technology Preview)

<p class="ciu_embed" data-feature="css-cascade-layers" data-periods="future_1,current,past_1,past_2" data-accessible-colours="false">
  <picture>
    <source type="image/webp" srcset="https://caniuse.bitsofco.de/image/once-event-listener.webp">
    <source type="image/png" srcset="https://caniuse.bitsofco.de/image/once-event-listener.png">
    <img src="https://caniuse.bitsofco.de/image/once-event-listener.jpg" alt="Data on support for the once-event-listener feature across the major browsers from caniuse.com">
  </picture>
</p>
<script src="https://cdn.jsdelivr.net/gh/ireade/caniuse-embed/public/caniuse-embed.min.js"></script>

Since layers are intended as foundational building blocks
of an entire CSS architecture,
it is difficult to imagine building manual fallbacks
in the same way you might for other CSS features.
The fallbacks would likely involve
duplicating large sections of code,
with different selectors to manage cascade layering.

The good news is:
- Modern browsers have a much faster release-cycle,
  so it may not be long before layers feel safe to use
  with only minimal fallbacks.
- The primary behavior of cascade layers
  can be [polyfilled](#potential-polyfills--workarounds) using a preprocessor,
  and there are people working on that.

### New `@supports` feature?

There is a new `@supports` feature in CSS
that will allow authors to test for support of `@layer`
and other at-rules:

```css
@supports at-rule(@layer) {
  /* code applied for browsers with layer support */
}

@supports not at-rule(@layer) {
  /* fallback applied for browsers without layer support */
}
```

However, it's not clear when that feature will be implemented.

### Assigning layers in HTML with the `<link>` tag

==todo==

https://github.com/whatwg/meta/issues/240

### Potential polyfills & workarounds

Because Cascade Layers have a 'cascade priority'
directly between ID selectors
and inline styles,
it's possible to mimic (or polyfill) their basic behavior
by carefully managing selector specificity.

There are many
[reasonable tools](https://css-tricks.com/dont-fight-the-cascade-control-it/)
that provide…

==todo==

## More resources

==todo==

Link to other articles and talks?
