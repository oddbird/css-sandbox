---
title: Scope Syntax Comparisons
eleventyNavigation:
  key: scope-syntax
  title: Syntax Comparisons
  parent: scope
---

There have been several different proposals
for how to handle scope or scope-like syntax.
Here are some of the considerations to pay attention to:

- Can you limit selections to a ["donut" of scope, with a **lower boundary**][donut]?
- Can you wrap **multiple selectors** in a shared scope?
- Can you apply [**scope proximity** to the cascade][proximity]?
- Does it integrate well with the proposed **css nesting** syntax?

[donut]: ../explainer/#the-lower-boundary-or-ownership-problem-aka-donut-scope
[proximity]: ../explainer/#scope-proximity

It seems to me that an at-rule is required for that third point.
Adding a new cascade feature to a normal selector
would feel surprising to me.
As such, the alternate selector-based proposals
(both originally proposed by Lea Verou)
have generally set aside
any concern for "scope proximity" in the cascade,
and focus entirely on the other points.
In combination,
that could imply a fifth question:

- Can you **separately** select a donut without applying proximity rules?

Since I imagine [scope proximity](../cascade/)
as a low-impact feature in the cascade,
I'm not sure how useful it is to have both features
but access one without the other?

## Current `@scope` proposal

I chose the at-rule for my initial proposal
because I think it allows us to solve
the first three concerns nicely:

- ✅ **lower boundaries** in the `to` clause
- ✅ **multiple selectors** allowed inside the at-rule
- ✅ **scope proximity** applied to the at-rule
- ✅ **css nesting** works like any other at-rule

The normal use-case
shows the first three points:

```css
/* at-rule applies donut boundaries and proximity */
@scope (.media) to (.content) {
  img { /* between the root and lower-boundary */ }
  .content  { /* the lower boundary itself is in-scope */ }
}
```

This can be integrated with CSS nesting in several ways.
Already, conditional at-rules are allowed
between the outer selector and nested rules.
This allows creating differently-scoped rules
on a single element:

```css
img {
  @scope (.media) to (.content) { & {
    /* nesting scoped variant at-rule */
  } }
}
```

We could also allow
the `&` selector in at-scope definitions,
to set the scope root:

```css
.media {
  @scope (&) to (.content) {
    & img { /* … */ }
    & .content { /* … */ }
  }
}
```

The existing proposal does not handle
our potential fifth case:

- ❌ donut-selection cannot be applied **separately** from cascade proximity

For that, we would need:

## Potential `:in-scope()` selector

If useful,
we could add a selector to handle donut scope
without applying cascade proximity behavior.
The selector would need to accept both a root & lower-boundaries --
which we can do with a slash-delimited syntax:

```css
img:in-scope(.media / .content) {
  /* donut scope selector */
}
```

This would allow authors to:

- ✅ define **lower boundaries**
  (using the function argument in the pseudo-class)
- ✅ apply this donut-selection **separately** from scope proximity
- ✅ integrate with **css nesting** in various ways, such as...

To establish the scope root:

```css
.media {
  @nest img:in-scope(& / .content) {
    /* using the parent as a root */
  }
}
```

To create scoped variants of an element:

```css
img {
  &:in-scope(.media / .content) {
    /* nesting scoped variant selector */
  }
}
```

I think it also allows

- ✅ grouping **multiple selectors**

It took me a bit to think through the pattern,
but the result looks fairly elegant:

```css
:in-scope(.media / .content) {
  &img { /* img:in-scope(…) */ }
  &.content { /* .content:in-scope(…) */ }
}
```

On its own, this would:

- ❌ not apply **scope proximity**

That's kinda the point,
as it allows the features to be used separately.

If we provided both the `@scope` rule and `:in-scope()` selector,
that combination would match all 5 criteria.

## Meaningful `:scope` when nesting CSS

A totally different (non-combinable) idea
is to give the existing `:scope` selector
a new meaning inside a nested context.
In this case, the `:scope` pseudo-class
has a similar meaning to `&`,
but rather than referring to the parent selector as a string,
it refers to the specific element
that would be selected by the parent.
This is similar to how `:scope` works in JavaScript.

{% import "alert.njk" as alert %}

{{ alert.warn("I'm not even sure this is possible,
since css nesting is meant to be simply syntax-sugar --
and I don't see any way to 'de-sugar' the scope selector here.
It relies on the nested syntax to have any meaning.") }}

That doesn't have much use on it's own,
but allows a workaround for defining lower boundaries,
when combined with the `:not()` pseudo-class:

```css
.media {
  & img:not(:scope .content *) { /* … */ }
}
```

That's not particularly elegant,
but maybe it's possible to
extend `:scope` so it accepts lower boundaries
in a functional syntax?

```css
.media {
  &:scope(.content) img { /* … */ }
}
```

In order to handle multiple selectors in a block,
this would require several layers of nesting:

```css
.media {
  &:scope(.content) {
    & img { /* … */}
  }
}
```

I don't think any of this is viable,
because it requires giving `:scope`
a nested meaning that cannot be expressed
outside the nesting context.
Otherwise, CSS nesting can be "de-sugared"
to simple selectors using `:is()`,
but not in this case.

## Conclusion

At this point,
I plan to start drafting a spec
that includes both the original `@scope` rule,
and the `:in-scope()` selector.
Once drafted,
the CSSWG can decide to remove one of them
if they are considered redundant.
