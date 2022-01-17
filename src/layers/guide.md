---
title: Draft Outline for an (In)Complete
created: 2022-01-14
eleventyNavigation:
  key: guide
  title: Draft Outline for an (In)Complete
  parent: layers
warn: false
note: |
  This is a draft document,
  working towards a more complete guide
  that can be published elsewhere.
---

## What are Cascade Layers, and why would I use them?

Some background,
introducing the problem to be solved.

### Less intrusive resets and defaults

One of the clearest initial use-cases
would be to make low-priority defaults
that are easy to override.

Some resets are starting to apply `:when()`
around each selector.
Layers allow you to more simply wrap
the entire reset stylesheet.

### Specificity conflicts with a third-party tool or framework

Make sure you control bootstrap,
and it doesn't control you!

### Managing a complex CSS architecture (across projects & teams?)

Implement a system like ITCSS
at scale,
using native browser features.

### Designing a CSS tool or framework

Frameworks can choose to expose or hide
layers as part of their API

### ❓ I just want this one property to be more `!important`

It depends,
but maybe that's the job of
`!important`?

### ❌ Scoping and namespacing styles? Nope!

[Recent twitter post](https://twitter.com/TerribleMia/status/1483171004235059202)

## Where layers fit in the Cascade

An overview of the whole thing.
Eventually, it seems like this could grow
to become a guide of it's own,
with links to sub-guides
for layers and specificity?

## Establishing a layer order

How layers stack, in the order they're mentioned.

### Order-setting `@layer` statements

Best practice: establish the order up-front.

### Layers and !importance

Important layers are reversed!

## Layering styles

### Block `@layer` rules

```css
@layer <name> {
  /* styles added to the layer */
}
```

### Nesting layers

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

```css
/* styles imported into to the <layer-name> layer */
@import url('../example.css') layer(<layer-name>);
```

### Anonymous (unnamed) Layers

```css
@layer {
  /* styles added to a new anonymous layer */
}
```

```css
/* styles imported into to a new anonymous layer */
@import url('../example.css') layer;
```

## Reverting layers

The `revert-layer` keyword.

## Browser support and fallbacks

- Table of browser support
- Lack of simple fallbacks (start slowly)
- Lack of `<link>` support
- Potential polyfills & workarounds

## More resources

Link to other articles and talks?
