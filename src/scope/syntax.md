---
title: Scope Syntax Options
created: 2021-07-22
changes:
  - time: 2021-07-25
    log: Clarifications
  - time: 2021-10-05T12:37:15-06:00
    log: Add possible selector notation & proximity combinator
eleventyNavigation:
  key: scope-syntax
  title: Syntax Options
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

## Selector Scope Syntax

Rather than using a pseudo-element,
which needs to be applied to each individual subject,
we might be able to come up with a new selector syntax
for describing the upper & lower boundaries of a scope.
For example:

```css
(.media / .content) img { ... }
```

This sort of syntax could be combined with nesting,
in order to scope multiple subjects:

```css
(.media / .content) {
  & img { ... }
  & .content { ... }
}
```

That could potentially handle:

- ✅ **lower boundaries** in parenthesis
- ✅ **scope proximity** based on scope roots
- ❌ ... but not **separately** from cascade proximity
- ✅ **css nesting** works like any other selector
- ✅ **multiple selectors** allowed through nesting

This raises some questions about
how to represent nested scopes,
and the `:scope` pseudo-class.

If we allow nesting
(and I think we should),
then
I would expect the nested syntax should de-sugar
much like other selectors:

```css
/* nested */
(body / aside) {
  & section {
    & (.media / .content) {
      & img { ... }
    }
  }
}

/* de-sugared */
(body / aside) section (.media / .content) img { ... }
```

In which case,
each additional scope notation
should like update the meaning of `:scope`
for all selectors following.
That could be slightly confusing,
since it might represent different elements
at different points in the selector.

In this example,
the first `:scope` matches a `body` element
being used as scope-root,
while the second `:scope` matches a scope-root `.media`:

```css
(body / aside) :scope (.media / .content) :scope img { ... }
```

Since a scope is a fragment of a document,
I would expect the inner scopes
to be limited by the outer scope --
so the resulting subject element
is a `body .media img` that is in the
intersection of the two scopes.

## Proximity Combinator

Since many authors expect proximity
to be taken into account
when comparing descendant selectors,
it might make sense to provide a new
descendant-like combinator with that behavior.
For the sake of comparison,
we can use `>>` as the syntax for now:

```css
.light-mode >> a { color: rebeccapurple; }
.dark-mode >> a { color: plum; }
```

That would behave the same
as existing descendant selectors,
except when specificity is equal --
in which case proximity weighting would be applied,
before source-order.

This would not be a full solution for scope,
since it does not include:

- ❌ **lower boundaries**

However, it could still be useful:

- ✅ **scope proximity** is applied
- ✅ ... **separately** from cascade proximity
- ✅ **css nesting** works like any other combinator
- ✅ **multiple selectors** allowed through nesting

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

❌ I don't think any of this is viable,
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
