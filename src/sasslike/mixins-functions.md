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

## Background

These aren't new questions.
At one point, there was a plan
for custom properties to act as a form of mixin.
That [`@apply` proposal was abandoned](https://www.xanthir.com/b4o00)
as the wrong approach,
but there are other possible solutions,
and several open discussions in the CSS Working Group:

- [[css-variables-2] Custom shorthands with @property #7879](https://github.com/w3c/csswg-drafts/issues/7879)
- [Declarative custom functions #7490](https://github.com/w3c/csswg-drafts/issues/7490)
- [[css-variables?] Higher level custom properties that control multiple declarations #5624](https://github.com/w3c/csswg-drafts/issues/5624)

(If there are more I haven't found,
please [let me know](https://github.com/oddbird/css-sandbox/issues).)

There is also some (incomplete) data
from the HTTP Archive project
that can help us understand
how authors are using Sass currently:

- [Stats on SCSS usage of control flow, conditional logic, nesting, custom functions #5798](https://github.com/w3c/csswg-drafts/issues/5798)

I have also written in depth
about how we can
[use custom properties to create pseudo-mixins/functions](https://www.smashingmagazine.com/2019/07/css-custom-properties-cascade/).
While those custom property tricks
can be useful,
they also come with significant complexity,
caveats, and limitations:

- Each 'function/mixin' and 'argument' is a custom property,
  which can only have a single resolved value per element
- Arguments are substituted in the function/mixin
  at 'time of definition' rather than 'time of use',
  so the logic has to be redefined everywhere it's used

Functions and mixins
have a lot in common.
Both provide a way to capture and reuse
some amount of logic.
That can be used for the sake of
developer shorthands,
and also as a way of ensuring maintainability
by avoiding repetition.
The difference between the two
is only in the type of output
they would provide in CSS:

- Functions return CSS _values_ --
  like a string, color, or length --
  that can be used inside a CSS property
- Mixins return CSS _declarations_
  (property-value pairs)
  or even rule blocks
  with selectors and other at-rules included

{% note %}
  While [CSS Nesting](https://drafts.csswg.org/css-nesting-1/)
  ensures that both declarations and rule blocks are allowed
  in a nested context,
  we would need to ensure that
  declaration-output is disallowed or ignored
  in non-nested contexts.
{% endnote %}

Sass provides some built-in core functions,
but (so far) does not provide core mixins.
Likely for that reason,
the HTTP Archive report lists
several commonly-used built-in functions
(`if()`, and `darken()`),
but only the most commonly used
custom mixin name (`clearfix`).

In addition to the different output types,
these popular functions and mixins
demonstrate a range of different input needs.

### Simple shorthands avoid repetition

A `clearfix` mixin
often has no exposed 'parameters',
and no internal logic.
When the mixin is invoked,
it will output
the same code every time.
This is useful for maintaining
DRY code (Don't Repeat Yourself),
but ends up very similar to using
a 'utility class' such as `.clearfix`.

In this case,
the main difference between a class
and a mixin comes from
how the repeated code is applied --
through HTML (for the class),
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

Most of the proposed solutions currently
rely finding ways to combine conditional logic
with selector logic,
so both can be defined at once.
In Sass, we would fix this instead
by providing a `dark-mode` mixin
that can be used multiple times
to output the same declarations
with only minimal repetition:

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

When we consider
the large number of properties usually involved,
the Sass mixin approach
would be significantly more concise than the original.

The `style()` feature of `@container`
could also be used to approximate this result.
Several [posts](https://front-end.social/@chriscoyier/110821892737745155)
and [articles](https://chriskirknielsen.com/blog/future-themes-with-container-style-queries/)
have been written about that approach.
However, style queries
share the limitation of other container queries --
we can't style the container being queried.
If we set a custom property 'mode'
on the `html` element,
and use it to assign all our properties,
we have to do that on a different element
(like `body`):

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
While they differ in Sass,
I would expect a CSS-native `@extend`
and a no-parameter-mixin to be functionally identical.

These features could provide some benefit to authors in CSS,
reducing code repetition and reliance on pre-processors
would simplify maintenance.
However, they likely wouldn't provide
new functionality over what is already possible.

It's much less common to have
functions without parameters,
since a simple value
can be captured in a variable
or custom property instead.
However, there are cases
where functions are still necessary.
For example,
a `random()` or `uid()` function,
where the output is meant to be different
on each use.

### Parameters and internal logic

By far the more common reason
to use a function or mixin
is the ability to define parameters
that alter the output
based on different input.
For example, a
 `darken()` function
would accept a color,
and an amount to darken that color.

In some cases (like `darken()`)
the internal function logic
can be represented by an inline calculation.
But more complex use-cases
may require conditional statements
or more complex 'flow control'
such loop structures.

For example,
a combination of mixins might generate
a full set of color-theme
custom properties
based on a single origin color.
In Sass,
it might looks something like this:

```scss
@use 'sass:color';
@use 'sass:math';

@mixin tint-shade($color, $name, $steps: 2) {
  --#{$name}: #{$color};

  $step: math.div(100%, ($steps + 1));

  @for $i from 1 through $steps {
    $amount: $step * $i;
    --#{$name}-t#{$i}: #{color.mix(white, $color, $amount)};
    --#{$name}-s#{$i}: #{color.mix(black, $color, $amount)};
  }
}

@mixin theme($color, $type: 'complement') {
  /* generate tints and shades for the main color */
  @include tint-shade($color, 'primary');

  @if $type == 'complement' {
    $complement: color.adjust($color, $hue: 180deg);
    @include tint-shade($complement, 'complement');
  } @else if $type == 'triad' {
    /* logic for triad themes… */
  }
  /* etc… */
}

html {
  @include theme(blue);
}
```

The resulting output CSS would be:

```css
html {
  /* generate tints and shades for the main color */
  --primary: blue;
  --primary-t1: #5555ff;
  --primary-s1: #0000aa;
  --primary-t2: #aaaaff;
  --primary-s2: #000055;
  --complement: yellow;
  --complement-t1: #ffff55;
  --complement-s1: #aaaa00;
  --complement-t2: #ffffaa;
  --complement-s2: #555500;
  /* etc… */
}
```

The ability to declare this logic in CSS
rather than a pre-processor
would provide several benefits:

- _Reduce the external dependencies_ and build steps
  required in order to generate the code
- _Reduce the file size delivered_ from the server
  (though this may be negligible after compression &
  increased client-side processing)
- _use custom properties as arguments_
  so that the mixins or functions
  could respond to changes in the cascade
- _use media/container/support conditions_
  as part of the internal logic

## Proposal: Basic Custom Functions

In July of 2022,
Johannes Odland proposed
'[Declarative custom functions](https://github.com/w3c/csswg-drafts/issues/7490)'
in the CSS Working Group issue tracker.
Since then,
the proposal has gone through
several revisions and updates.
A long the way,
a few issues/goals have come up
that are worth noting:

- Functions would be resolved
  at the same time as variable substitution
- Function parameters defined with a CSSOM 'type'
  can be validated at parse time
  (like `@property`-registered variables)
- This would be a declarative version
  of the more full-featured Houdini JS feature

The current state of the proposal
looks something like this
(to produce a fluid typography value
based on viewport widths):

```css
/* line breaks for readability only */
@custom-function --fluid-ratio(
  --min-width "<length>",
  --max-width "<length>"
) {
  result: clamp(
    0%,
    100% * (100vw - var(--min-width)) / (var(--max-width) - var(--min-width)),
    100%
  );
}

p {
  font-size: mix(--fluid-ratio(375px, 1920px), 1rem, 1.25rem);
  padding: mix(--fluid-ratio(375px, 700px), 1rem, 2rem);
}
```

{% note %}
  In addition to the new syntax proposed here,
  browsers would also need to implement
  [unit-division in math functions](https://drafts.csswg.org/css-values/#calc-type-checking)
  for this use-case.
{% endnote %}
