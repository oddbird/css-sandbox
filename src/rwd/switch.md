---
title: Switch Function
eleventyNavigation:
  key: switch-function
  title: Switch Function
  parent: rwd
---

The `switch()` function would provide conditional logic in CSS values,
similar to the Sass `if()` function,
but with access to some essential client-side values for comparison:
primarily `available-inline-size`.

If you think of it as a full solution
it can look bulky,
because it works one-property-at-a-time.
But if you think about use-cases where
_you only need to adjust one property_,
this becomes much more attractive
than adding fully distinct blocks
for each breakpoint.

## Status

- Igalia: [Prototype in Chromium](https://www.youtube.com/embed/8QFST9MvjyA)

## Resources

_From [Brian Kardell](https://bkardell.com/) & [Igalia](https://www.igalia.com/)_

- [Towards Responsive Elements](https://bkardell.com/blog/TowardResponsive.html)
- [A `switch()` function in CSS](https://gist.github.com/bkardell/e5d702b15c7bcf2de2d60b80b916e53c)
- [All Them Switches](https://bkardell.com/blog/AllThemSwitches.html)

## Background

The [query-block](../query/) approach
relies on [CSS Containment](https://drafts.csswg.org/css-contain/)
to avoid infinite loops -
and specifically [single-axis size containment](https://github.com/w3c/csswg-drafts/issues/1031)
which _might not be possible_.

The `switch()` proposal avoids those issues by limiting
the properties that an author is able to switch,
ensuring they never impact container size
(no `font-size`, `width`, etc).

Those limits come from the internal architecture of browser engines,
and make it possible to implement `switch()`
without relying on other hypothetical CSS features.

This might require teaching authors
the essential phases of browser rendering,
for a better understanding of _why_
only certain properties are supported.

Igalia has already developed a working prototype:

<figure data-ratio>
<iframe width="560" height="315" src="https://www.youtube.com/embed/8QFST9MvjyA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</figure>

## Syntax

The initial proposal suggests:

```css
.foo {
  display: grid;
  grid-template-columns: switch(
    (available-inline-size > 1024px) 1fr 4fr 1fr;
    (available-inline-size > 400px) 2fr 1fr;
    (available-inline-size > 100px) 1fr;
    default 1fr;
   );
}
```

The implemented prototype is a bit different,
but seems like a temporary way to fit existing CSS syntax:

```css
.foo {
  display: grid;
  grid-template-columns: switch(
    auto /
     (available-inline-size > 1000px) 1fr 2fr 1fr 2fr /
     (available-inline-size > 500px) auto 1fr /
   );
}
```

There is also a comment from
[Fantasai](https://gist.github.com/bkardell/e5d702b15c7bcf2de2d60b80b916e53c#gistcomment-3295085)
with a proposal to make the syntax more efficient.

```css
.foo {
  grid-template-columns: switch( available-inline-size ?
    (? > 1024px) 1fr 4fr 1fr;
    (? > 400px) 2fr 1fr;
    (? > 100px) 1fr;
    1fr;
  );
}
```

## Thoughts

The two main "responsive component" approaches
complement each other well --
because they come at the same question (and all the tradeoffs)
from opposite sides.
The main advantages of `switch()` show up
when you want to query the size of a grid-track
rather than the element generating that track.

The `switch()` function is also very flexible,
and could solve many other context-responsive styling issues --
like adjusting `<em>` styles based on the inherited `font-style`,
or toggling values based on a variable.
That seems promising on multiple fronts.

Any inline-conditional syntax is bound to take up space,
and add clutter to CSS.
I'm not sure that's avoidable,
but it would be good to try and make the syntax
as light-weight as reasonable.

That becomes more of an issue if this were the _only_ way
to write conditional CSS.
Many languages provide both inline & block conditionals,
for good reason --
there are cases for each --
and I think that might also be the way to go in CSS.

## Questions

### Can we improve the balance of readability/efficiency?

This question seems intertwined
with a few other active discussions
about more generic block & inline conditionals.
Several of them are linked from
this proposal by Lea Verou:

[Higher level custom properties that control multiple declarations][5624]

[5624]: https://github.com/w3c/csswg-drafts/issues/5624

### What observations can we support, on what properties?

The primary focus is on `available-inline-size`
used in grid-templates,
with mention of future ideas like `inherited-font-style`.
I'd love to flesh out that thinking a bit more.

Even if `available-inline-size` is enough for Level 1,
we need to define where and how it can be used.

### Can a single switch contain multiple observations?

The existing proposals & demos show
`available-inline-size` as the only value being observed.
If more observations are allowed,
will the syntax support combining/mixing observations
within a single switch function?
