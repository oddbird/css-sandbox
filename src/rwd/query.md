---
title: Container Rule
eleventyNavigation:
  key: container-rule
  title: container rule
  parent: rwd
---

Since container-queries are often seen as
an extension of media-queries,
the most common proposal is to add an `@`-rule
block syntax that works similar to existing `@media`.

Since the contents of a block can impact it's size,
this would require both `layout` and `size` containment
to avoid infinite style loops.

## Resources

- David Baron:
  [Thoughts on an implementable path forward](https://github.com/dbaron/container-queries-implementability)
- W3C: [CSS Containment Module](https://drafts.csswg.org/css-contain/)

## Issues

- [Single-axis Containment](https://github.com/w3c/csswg-drafts/issues/1031)

## Syntax

David Baron's proposal requires
an explicit selector for defining the container:

```css
@container .media-object (width > 45em) {
  .media-object {
    grid-template: 'img content' auto / auto 1fr;
  }
}
```

But that explciy selector requirement
makes it impossible to have fully-modular components
that respond to _any context_.
So I think this syntax should allow for
_implicit_ containers (much like positioning context)
created whenever `contain: size` is applid to an element:

```css
main,
aside {
  contain: size;
}

@container (width > 45em) {
  .media-object {
    grid-template: 'img content' auto / auto 1fr;
  }
}
```

## Questions

## Is single-axis containment even possible?

@@@ ToDo

...See the [CSSWG 1d containment issue](https://github.com/w3c/csswg-drafts/issues/1031)

### Should we build this into `@media`? [❌]

My immediate instinct was that container-queries
really are the same as media-queries,
and we could handle both in the existing `@`-rule --
something like:

```css
@media screen and container(width > 45em) { ... }
```

The immediate issue is that font-relative sizes in `@media`
resolve based on the inherited viewport font size,
before any document styles are applied.
But container queries refer to a specific element in the DOM,
and should ideally resolve based on that element's styles.

I think that reflects a broader issue:
"media" may be a part of "context" --
but they are fairly different concepts here.

### Should we allow implicit & explicit containers?

I think implicit containers are required
for most of the use-cases.
