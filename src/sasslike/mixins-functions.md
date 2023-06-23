---
draft: 2023-06-22
title: CSS Mixins and Functions
eleventyNavigation:
  key: mixins-functions
  title: CSS Mixins and Functions
  parent: sasslike
warn: This is still a partial draft
---

This is an exploration
of the often-asked questions:

- Should CSS provide authors the ability
  to create custom 'mixins' and 'functions'
  similar to Sass?
- If so, how would CSS 'mixins' and 'functions'
  differ from Sass?
  What extra functionality or limitations
  come from providing these features
  in the browser?

## Some background

These aren't new questions.
At one point, there was a plan
for custom properties to act as a form of mixin.
That [`@apply` proposal was abandoned](https://www.xanthir.com/b4o00)
as the wrong approach,
but this was never meant as a rejection of the core concept.
There are other possible solutions,
and several open discussions in the CSS Working Group:

- [[css-variables-2] Custom shorthands with @property #7879](https://github.com/w3c/csswg-drafts/issues/7879)
- [Declarative custom functions #7490](https://github.com/w3c/csswg-drafts/issues/7490)
- [[css-variables?] Higher level custom properties that control multiple declarations #5624](https://github.com/w3c/csswg-drafts/issues/5624)

(If there are more I haven't found,
please [let me know](https://github.com/oddbird/css-sandbox/issues))

There is also some (incomplete) data
from the HTTP Archive project
that can help us understand
how authors are using Sass currently:

- [Stats on SCSS usage of control flow, conditional logic, nesting, custom functions #5798](https://github.com/w3c/csswg-drafts/issues/5798)

I have also written in depth
about how we can
[use custom properties to create pseudo-mixins/functions](https://www.smashingmagazine.com/2019/07/css-custom-properties-cascade/) --
which can be useful,
but also comes with a number of caveats
and limitations.

## A range of function-ality

Functions and mixins
have a lot in common.
Both provide a way to capture and reuse
some amount of logic --
both as a shorthand,
and as a way of ensuring maintainability
by avoiding repetition.
The difference between the two
is only in the type of output
they would provide in CSS:

- Functions return a `value` --
  like a string, color, or length --
  that can be used inside a CSS property
- Mixins return CSS declarations
  (property-value pairs)
  or even entire rule blocks

{% note %}
  In developing CSS-native mixins,
  we could consider declaration-output
  and rule-output to be distinct features.
  While [CSS Nesting](https://drafts.csswg.org/css-nesting-1/)
  ensures that both are allowed
  as nested output,
  it may still be problematic
  to allow top-level mixins
  that could potentially output bare declarations?
{% endnote %}

Sass provides some built-in functions,
but no built-in mixins.
Likely for that reason,
the HTTP Archive report lists
several commonly-used built-in functions
(`if()`, and `darken()`),
but only the most commonly used
custom mixin name (`clearfix`).

In addition to the different output types,
these popular functions and mixins
demonstrate a range of different input needs.

### Just the output, please

A `clearfix` mixin
often has no exposed 'parameters',
and no internal logic.
When the mixin is invoked,
it simply outputs
the same code every time.
This is useful for maintaining
DRY code (Don't Repeat Yourself),
but ends up very similar to using
a 'utility class'
(`.clearfix` is also common).

In this case,
the main difference between a class
and a mixin comes from
how the repeated code is applied --
through html (for the class),
or directly in CSS (for mixins).
The need for CSS control
comes into focus when combined
with `@media`/`@container` and other conditional logic.
There is currently no way in CSS
to write this code without
defining all the custom properties twice:

```css
.dark-mode {
  --background: black;
  --text: white;
  /* more custom props as needed… */
}

@media (prefers-color-scheme: dark) {
  html:not(.light-mode) {
    --background: black;
    --text: white;
    /* more custom props as needed… */
  }
}
```

Most of the proposed solutions for solving that issue,
rely finding ways to combine conditional logic
with selector logic,
so both can be defined at once.
In Sass, we would fix this instead
by providing a `dark-mode` mixin
that can be used multiple times
to output the same declarations
without manual repetition:

```scss
@mixin dark-mode {
  --background: black;
  --text: white;
  /* more custom props as needed… */
}

.dark-mode {
  @include dark-mode;
}

@media (prefers-color-scheme: dark) {
  html:not(.light-mode) {
    @include dark-mode;
  }
}
```

(In reality,
where there are often more than two properties involved,
the Sass mixin approach
would be more concise than the original)

While the `style()` feature of `@container`
can be used to approximate this result,
it has the limitation of other container queries --
we can't style the container being queried.
If we set a custom property 'mode'
on the `html` element,
and use it to assign all our properties,
we have to do that on a different element:

```css
.dark-mode {
  --mode: dark;
}

@media (prefers-color-scheme: dark) {
  html:not(.light-mode) {
    --mode: dark;
  }
}

@container style(--mode: dark) {
  /* The html element cannot query itself */
  body {
    --background: black;
    --text: white;
    /* more custom props as needed… */
  }
}
```

Mixins without parameters can also
overlap with the Sass `@extend` rule,
which is used to have more semantic selectors
'extend' another class in CSS.
This may also be something
that CSS should consider providing?

It's less common to have
functions without parameters,
since the same behavior
can generally be captured in a variable
or custom property.
However, there are cases
where functions are still necessary:

- If the output is meant to be different each time,
  as with a `random()` or `uid()` function
- If the internal logic is too complicated
  to capture in a simple variable

### Parameters and internal logic

…to be continued…
