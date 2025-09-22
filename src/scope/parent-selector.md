---
title: Defining the `&` selector in a `@scope` rule
created: 2025-07-02
---

TL;DR
we [resolved](https://github.com/w3c/csswg-drafts/issues/9740#issuecomment-3028423633)
during the scope breakout session
that `&` nested directly inside `@scope`
should refer to the implicit `:where(:scope)` selector
that is prepended on
declarations and scoped selectors
by default.
This post explains
the thought process behind our decision --
which is a change
from the current specification.

## How the `&` selector works, when nesting

CSS nesting gave us the `&` selector.
When used in a nested context,
it 'represents' the parent selector
wrapped with `:is()`:

```css
.parent {
  & { color: green; }
  & > .child { color: red; }
}
```

This can be 'de-sugared'
to conventional un-nested syntax:

```css
:is(.parent) { color: green; }
:is(.parent) > .child { color: red; }
```

The `&` has been swapped out,
and replaced by the parent selector.
It matches the same elements as the parent selector,
with the same specificity.
In the examples above
(where `&` is the start of the selector)
we're allowed to leave it out
and _imply_ the relationship.
This has exactly the same behavior
and specificity as our examples above:

```css
.parent {
  color: green;
  > .child { color: red; }
}
```

If we add the `&` to the selector,
the implicit `&` is not applied.
These two rules are the same:

```css
.parent {
  .context > & { color: red; }
}

.context > :is(.parent) { color: red; }
```


Note that `&`…

- Represents the parent selector, matching the same elements
- Is implied at the start unless explicitly placed in a nested selector
- Implicit and explicit starting `&` match the same elements
- Implicit and explicit starting `&` have the same specificity

## How the `:scope` selector works

Despite `@scope` being new in CSS,
'scoped' styles have existed for some time,
and the `:scope` pseudo-class has
a well-established behavior.
The main examples I'm familiar with
are the JavaScript `querySelector()` methods.
Since the query is run on an element,
the `:scope` pseudo-class represents
that 'scope root' element.
When left out,
it is implied at the start of the selector --
so these two queries select the same elements:

```js
parentElement.querySelector('a');
parentElement.querySelector(':scope a');
```

Again, if we move `:scope` elsewhere in the selector,
it's no longer implied at the start.
The following will match links in scope
when the scope is also inside an element
with the `.context` class:

```js
parentElement.querySelector('.context :scope a');
```

While it has been less useful,
`:scope` is also allowed in plain CSS,
where it behaves the same as `:root`.
Since there is no other scope root defined,
the implied scope is the document root.
And since `:scope` is a pseudo-class,
it has the specificity of a class selector.

Note that `:scope`…

- Represents the single scope-root element
- Is implied at the start unless explicitly placed in a scoped selector
- Implicit and explicit starting `:scope` match the same element
- Implicit and explicit starting `:scope` have _different_ specificity

Since only the specificity is different,
we can think of the implicit scope as being
something like `:where(:scope)` --
with zero specificity.

## How the `@scope` rule works

The new `@scope` rule
allows authors to define scoped styles in CSS.
This has a lot of [overlap with nesting](/scope/nesting/),
because (until now)
the default 'descendant combinator'
has been our best approximation
of the scope use-case.

These two selectors are similar,
and should match the same elements --
a `.child` class
descendant of the `#parent` ID.

```css
#parent {
  .child { color: green; }
}

@scope (#parent) {
  .child { color: green; }
}
```

But the `@scope` rule
is intended for filtering only,
and does not add any implicit specificity.
We can see how that is the result
of the behavior we described above,
by making the implicit selectors explicit.
The nested selector here
has a specificity
of the parent ID and child class together,
while the scoped selector
only has the child class specificity:

```css
#parent {
  /* specificity: 1,1,0 */
  & .child { color: green; }
}

@scope (#parent) {
  /* specificity: 0,1,0 */
  :where(:scope) .child { color: green; }
}
```

If we add bare declarations
inside an `@scope` rule,
the behavior is similar.
These two `color` declarations
have the same
meaning and specificity:

```css
@scope (#parent) {
  color: green;

  :where(:scope) { color: green; }
}
```

## What does `&` represent, when scoping?

The question is what it means to use
`&` in an `@scope` context.

### The original spec

A scoped `&`
could refer to the `<scope-start>` _selector_
(`#parent` in the previous example).
But then adding the `&`
at the start of a selector
changes both the specificity
and also what it can match:

```css
@scope (.parent) {
  /* - only selects the :scope itself */
  /* - specificity of 0,0,0 */
  border: thin dotted;

  /* - selects any .parent that is in-scope */
  /* - specificity of 0,1,0 */
  & { border: thin dotted; }
}
```

This was the initial shape of the specification,
but was raised as
an [issue by Roman Komarov](https://github.com/w3c/csswg-drafts/issues/9740).
While `&` here can be seen as
'referencing the parent selector',
the resulting behavior is actually quite different
from the way `&` works in a nested context.
The decision to add it or leave it off
has a big impact on the meaning and specificity of a style.

An author is given multiple options,
all with subtly different behavior
that might be hard to learn:

- Bare declarations match only the scope-root at zero specificity
- `:where(:scope)` is the same as the implicit behavior
- `:scope` matches only the scope root, with 1-class specificity
- `&` matches based on a selector, with that selector's specificity

### The proposed change

But if we think of `&` instead as
'referencing the implicit context' of a selector,
we can fix that.
From that perspective,
the 'parent selector' of an `@scope` rule
is actually `:where(:scope)` --
since that's the selector added implicitly
at the start of scoped selectors.
Now three of these selectors behave the same:

```css
@scope (.parent) {
  /* - only selects the :scope itself */
  /* - specificity of 0,0,0 */
  border: thin dotted;
  :where(:scope) { border: thin dotted; }
  & { border: thin dotted; }

  /* same behavior, different specificity */
  :scope { border: thin dotted; }
}
```

The `&` _behaves_ the same way as it does
when nesting,
representing our implicit parent context directly.
Adding or removing the implicit `&`
gives us the same results.
That allows authors
to use `&` consistently in both
nested and scoped contexts,
as a reference to the implicit selector
which will otherwise be prepended.

This is
[the solution we resolved on](https://github.com/w3c/csswg-drafts/issues/9740#issuecomment-3028423633)
during the scope breakout session --
but we plan to re-visit
with the full group next week.
