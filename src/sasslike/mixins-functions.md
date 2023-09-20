---
created: 2023-08-21
title: CSS Mixins and Functions Explainer
tags:
  - explainer
  - mixins-functions
changes:
  - time: 2023-08-22T10:20:26-06:00
    log: Document issues with function fallbacks
  - time: 2023-08-22T13:11:04-06:00
    log: >
      Use semi-colon as argument delimiter,
      and add named arguments
  - time: 2023-09-12T18:56:01+02:00
    log: >
      Clarifications and updates
      based on initial review and informal TPAC discussions
  - time: 2023-09-12T19:40:02+02:00
    log: >
      Document potential built-in keyframes mixin
  - time: 2023-09-13T10:03:41+02:00
    log: Provide acknowledgments
---

Over the years,
many features from Sass and other
CSS pre-processors (Less, Stylus, PostCSS, etc)
have made their way into browsers
as part of CSS itself.
Along the way,
those features generally change --
taking on different affordances and constraints
appropriate for a declarative client-side language.

However,
there are several popular features
that have not yet made the transition.
This document explores
some of those outstanding features,
and asks:

- Should CSS provide authors the ability
  to create custom 'mixins' and 'functions'?
- If so, how would CSS 'mixins' and 'functions'
  differ from pre-processors?
  What extra functionality or limitations
  come from providing these features
  in the browser?

## Discussion

I posted this proposal
to a new issue in the CSS Working Group:

- [Proposal: Custom CSS Functions & Mixins #9350](https://github.com/w3c/csswg-drafts/issues/9350)

The proposal is based largely
on an existing issue specific to functions:

- [Declarative custom functions #7490](https://github.com/w3c/csswg-drafts/issues/7490)

Issues specific to this document
(such as typos or corrections)
can be filed on Github:

- [OddBird CSS Sandbox Issues](https://github.com/oddbird/css-sandbox/issues)

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
  _before the computed value inherits_,
  so the logic has to be redefined
  on every element that should re-calculate a result

{% note %}
'Parameters' and 'arguments'
are somewhat interchangeable terms,
but here I am assuming that:
- A 'parameter' is a variable that is
  named and registered
  _where the function/mixin is defined_.
  A `darken()` function might expose
  `color` and `amount` parameters.
- An 'argument' is a value passed into
  one of the registered parameters
  _where the function/mixin is used_.
  When calling the the `darken()` function,
  we could pass `red` and `50%` arguments
  to the `color` and `amount` parameters.
{% endnote %}

From a language perspective
these mixins and functions are somewhat distinct --
they live at different levels of the syntax,
and come with different complications.
It may make sense to
handle them in different levels of a specification
(likely functions-first)
or even different specifications.
However,
they have a lot in common
from the author perspective --
so we should consider carefully
what syntax can be shared,
or where differences should be made clear.
That's why I'm exploring them together.

Both provide a way to capture and reuse
some amount of logic.
That can be used for the sake of
developer shorthands,
and also as a way of ensuring maintainability
by avoiding repetition.
The difference between the two
is where they can be used in CSS,
based on the type of output
they provide:

- Functions return CSS _values_ --
  like a string, color, or length --
  and can be used inside a CSS property
- Mixins return CSS _declarations_
  (property-value pairs)
  or even _rule blocks_
  with selectors and other at-rules included

These features are popular for
reducing code repetition,
and encouraging consistent use of best practice.
Removing the reliance on pre-processors
would further simplify maintenance for CSS authors --
while providing new client-side functionality:

- Passing cascaded custom-properties as arguments.
- Adding media/support and other client-side conditions to function logic.

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

When no parameters are exposed,
the main difference between a class
and a mixin comes from
how the repeated code is applied --
through HTML attributes (for the class),
or directly in CSS to other selectors (for mixins).
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

Most of the currently proposed solutions
to that problem
combine conditional logic
with selector logic,
so that both can be defined at once.
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

It's less common to have
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
can be represented by an inline calculation
using existing CSS features.
But more complex use-cases
may require conditional statements
or more complex 'flow control'
such as loops.

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

### Existing Proposal for Custom Functions

In July of 2022,
Johannes Odland proposed
'[Declarative custom functions](https://github.com/w3c/csswg-drafts/issues/7490)'
in the CSS Working Group issue tracker.
Since then,
the proposal has gone through
several revisions and updates.

The current plan is that:

- Functions would be resolved
  at the same time as variable substitution
- Function parameters defined with a CSSOM 'syntax'
  can be validated at parse time
  (like `@property`-registered variables)
- This would be a declarative version
  of the more full-featured Houdini API feature

The current (2023-08-08)
proposal in that thread
provides several examples
for clamped fluid typography:

```css
@custom-function --fluid-ratio(
  --min-width,
  --max-width
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

The thread also includes
a function for generating checkerboard background-images:

```css
@custom-function --checkerboard(--size) {
   result: linear-gradient(
        45deg,
        silver 25%,
        transparent 25%,
        transparent 75%,
        silver 75%
      )
      0px 0px / var(--size) var(--size),
    linear-gradient(
        45deg,
        silver 25%,
        transparent 25%,
        transparent 75%,
        silver 75%
      )
      calc(var(--size) / 2) calc(var(--size) / 2) / var(--size) var(--size);
}

.used {
  background: --checkerboard(32px);
}
```

For these use-case,
custom functions could be a simple wrapper
for inserting parameters into
existing functions like `calc()`.
Tab Atkins has suggested a math-only version of this
would be simplest to implement.
While that would be a useful first-step,
it quickly falls short of the use-cases I've seen.
I would prefer to start with a more fully-featured approach,
and work backwards to an attainable level 1 implementation
if needed.

In addition to some additional bike-shedding of the syntax,
there are several more open questions in the thread:

- Can authors provide a fallback output
  for invalid arguments?
- Would it be helpful to include default parameter values
  in the function definition?
- Can function authors define internally-scoped custom properties?
- Can authors use conditional at-rules
  inside the function logic?
- Can functions expose a parameter
  that accepts bare calculations (without `calc()` syntax)
  similar to `clamp()` etc?
- Can functions perform recursive function calls?
- Can functions be called with named
  (rather than positional) arguments?

I hope to expand on this proposal,
and explore some of those questions along the way.

## Defining a function: the `@function` rule

In order to define a custom function,
we need several bits of information:

- A required `function-name`
- An optional ordered parameter list, where each `parameter` includes:
  - A required `parameter-name`
  - An optional(?) `parameter-syntax`
  - An optional `parameter-initial-value`
- Some amount of internal logic using `function-rules`
- A returned `result` value

The proposed syntax
(with a few adjustments)
could look something like:

```
@function <function-name> [( <parameter-list> )]? {
  <function-rules>

  @return <result>;
}
```

The `function-name` is a dashed-ident.
If multiple functions have the same name,
then functions in a higher cascade layer take priority,
and functions defined later have priority
within a given layer.

### Returning values

The specified `<result>` value can
accept the same broad CSS syntax as custom property values.
At computed value time,
that output can be resolved and validated
against the property that called the function.

I like an at-rule syntax (e.g. `@return`)
rather than a `result` descriptor.

- It helps distinguish
  the final returned value from any internal logic
  like custom properties and nested rules
- Result is not a property,
  but looks a lot like one

Update: François Remy
has proposed setting a custom property
with the same name as the function,
and that property is treated as the resulting value.

Whatever syntax we use,
they should all be able to support
the same basic behavior.
We can continue to bike-shed the details.

When multiple `result`s are returned,
we need a way to determine which one is used.
While many languages allow an 'eager'
_first-takes-precedence_ function return,
CSS often uses a _last-takes-precedence_ approach --
both in the cascade of properties,
and to resolve naming conflicts (e.g. keyframes).

Either approach should work here as well,
though I would lean towards the latter
for the sake of internal consistency.

### Parameter lists

Each `<parameter>`
in the `<parameter-list>`
must have a `<name>`, along with an
optional `<syntax>` (default to universal syntax),
and optional `<default-value>`
(the guaranteed-invalid value when undefined).
This matches closely to the needs
of [global property registration](https://github.com/w3c/csswg-drafts/issues/9206),
though working in a more restricted space.

Default values in this context
should be distinct from
'initial' values of a globally-registered
custom property.
Initial values come with additional restrictions,
such as being computationally-independent
when the syntax is defined.
These defaults should behave more like fallback values
in the `var()` syntax,
used when the passed-in argument is guaranteed-invalid.

In my mind, it would be great to build on
the way authors currently define custom properties.
This would work for `--name: default-value;`
in a straight-forward way --
and could potentially include `--name-only;` --
but has several limitations
when we want to capture both `default-value` and `syntax`:

- Value parsing is very broad and forgiving,
  making it hard to combine anything along-side `default-value`
- It should be possible to define any combination
  of `default-value` and `syntax`
  without requiring either one

While I'm tempted to develop a one-line syntax for this,
the `@property` rule may be our best reference.
By using a block syntax
we can avoid inventing a new esoteric syntax,
while also leaving space for future extensions:

```css
@function --example (
  --arg-one;
  --arg-two: with default value;
) {
  @parameter --arg-one {
    default: 2em;
    syntax: "<length>";
  }
  /* … */
}
```

Emilio Cobos Álvarez
suggested using name-only in the parameter list,
and providing any additional details
in the body of the function/mixin:

```css
@function --example (--arg-one, --arg-two) {
  @parameter --arg-two {
    default: 2em;
    syntax: "<length>";
  }
  /* … */
}
```

That removes the need for `;` delimiters
in the prelude to the at-rule.

As with other matters of syntax,
we can bike-shed the details as necessary.

## Calling functions

When calling functions,
we may want to allow a similarly broad
syntax for argument values.
In order to achieve that,
we could again use `;` as the argument delimiter:

```css
button {
  background: --contrast(pink; WCAG-AAA);
}
```

{% note %}
  There is (at least in theory)
  some precedent for this in CSS --
  though I'm not sure any of them have been implemented.
  Hopefully
  I'm not invoking a spec-deadly pattern here.
{% endnote %}

For more complex functions
it can often be useful to use
named parameters rather than a positional syntax.
The most direct solution would be to allow
the full declaration syntax here --
though I'm not sure if that's viable:

```css
button {
  background: --contrast(--color: pink; --ratio: 0.7);
}
```

To differentiate positional and named arguments,
we may need additional syntax
and limitations on positional values.
For example, wrapping named arguments in brackets,
and disallowing positional arguments
with wrapping brackets:

```css
button {
  background: --contrast({ --color: pink; --ratio: 0.7 });
}
```

Edit: Emilio suggests
we may also be able to parse named arguments
based only on a dashed-ident followed by a colon.
If that's true, it's likely the better solution.

If positional and named arguments
are allowed in the same function call,
the common convention is to require
all positional values come before any named values
to avoid confusion:

```css
button {
  background: --contrast(pink; { --ratio: 0.7 });
}
```

### Function rules

The `<function-rules>` can include custom property declarations
(which are scoped to the function),
as well as conditional at-rules
(which may contain further nested
custom properties and `@return` values).
Element-specific conditions (such as container queries)
would be resolved for each element that calls the function.

My assumption
would be that custom properties
defined inside the function
are not available
on elements where the function is called,
and (maybe less obvious)
custom properties defined or inherited on an element
cannot be referenced in the function
without being passed in as an argument.
Any passing of values between the two contexts
would have to be explicit, via provided parameters,
to avoid accidental naming conflicts
or side-effects.

As far as I can tell,
only custom properties and conditional rules
are useful inside a function definition.
Since functions have no output
besides their returned value,
nested selectors, built-in properties,
and name-defining rules
are not necessary or meaningful.
I don't think there's any need for these things
to invalidate the entire function,
so they should be ignored and discarded.

An example function
using conditional rules
to return one of multiple values:

```css
@function --sizes(
  --s: 1em;
  --m: 1em + 0.5vw;
  --l: 1.2em + 1vw;
) {
  --min: 16px;

  @media (inline-size < 20em) {
    @return max(var(--min), var(--s));
  }
  @media (20em < inline-size < 50em) {
    @return max(var(--min), var(--m));
  }
  @media (50em < inline-size) {
    @return max(var(--min), var(--l));
  }
}
```

### Putting it all together

Adapting the fluid ratio function above
to my proposed syntax:

```css
@function --fluid-ratio(
  @parameter --min-width {
    default: 300px;
    syntax: "<length>";
  };
  @parameter --max-width {
    default: 2000px;
    syntax: "<length>";
  };
) {
  --scale: calc(var(--max-width) - var(--min-width));
  --current: calc(100vw - var(--min-width));
  --fraction: calc(var(--position) / var(--scale));

  @return clamp(
    0%,
    100% * var(--fraction),
    100%
  );
}

p {
  font-size: mix(--fluid-ratio(375px; 1920px), 1rem, 1.25rem);
  padding: mix(--fluid-ratio(375px; 700px), 1rem, 2rem);
}
```

We could also consider moving the `mix()` logic
into the function:

```css
@function --fluid-mix(
  --min-value;
  --max-value;
  @parameter --min-width {
    default: env(--fluid-min, 375px);
    syntax: "<length>";
  }
  @parameter --max-width {
    default: env(--fluid-max, 1920px);
    syntax: "<length>";
  }
) {
  --scale: calc(var(--max-width) - var(--min-width));
  --current: calc(100vw - var(--min-width));
  --fraction: calc(var(--position) / var(--scale));
  --ratio: clamp(0%, 100% * var(--fraction), 100%);

  @return mix(var(--ratio), var(--min-value), var(--max-value));
}

p {
  font-size: --fluid-mix(1rem; 1.25rem);
  padding: --fluid-mix(1rem; 2rem; 375px; 700px);
}
```

If/when there is an ability
for authors to define globally-available
custom properties or environment variables,
we could make the initial parameter values
responsive to those global settings:

```css
@function --fluid-mix(
  --min-value;
  --max-value;
  @parameter --min-width {
    default: env(--fluid-min, 375px);
    syntax: "<length>";
  }
  @parameter --max-width {
    default: env(--fluid-max, 1920px);
    syntax: "<length>";
  }
) { /* … */ }
```

## Defining a mixin: the `@mixin` rule

Rather than returning a single value,
mixins return entire declarations
and potentially entire nested rule blocks.
While much of the function syntax
could be re-purposed,
we would need an additional way
to manage property scoping --
clearly marking what rule blocks are internal,
and which should be part of the output.

```
@mixin <mixin-name> [( <parameter-list> )]? {
  <mixin-rules>
}
```

Again, when there are multiple mixins
that use the same name,
the last mixin with that name
takes precedence.

### Mixin rules and output

The simplest approach
to nested rules and output
would be to treat the inside of a mixin definition
the same as any rule-block nested context.
Anything we can put inside a rule block
can be put inside a mixin,
and will be output where the mixin is called
(with any parameters being replaced first).
This will work for many simpler cases:

```css
@mixin --center-content {
  display: grid;
  place-content: center;
}

.page {
  @apply --center-content;
  /*
    display: grid;
    place-content: center;
  */
}
```

```scss
@mixin --clearfix {
  &::after {
    display: block;
    content: "";
    clear: both;
  }

  @supports (display: flow-root) {
    display: flow-root;

    &::after { display: none; }
  }
}

.float-container {
  @apply --clearfix;
  /*
    &::after {
      display: block;
      content: "";
      clear: both;
    }

    @supports (display: flow-root) {
      display: flow-root;

      &::after { display: none; }
    }
  */
}
```

However,
this approach doesn't allow
the mixin to contain any internal logic
scoped to the mixin itself.
Mixins should be able to
use internally scoped custom-properties,
and also optionally _output_ custom properties
as part of the returned rule block.
As things stand,
this doesn't seem relevant
to anything other than custom properties.
Built-in properties, selectors, and at-rules
are only useful for their output.

Given that this issue is specific to custom properties,
we could consider a flag such as `!private`.
That flag could be interesting
for custom properties in other contexts,
but I won't follow that path unless there's interest.
Alternatively,
we could explicitly mark content for output
with a block rule version of `@return`.

### Applying mixins: the (new) `@apply` rule

In order to apply a mixin,
we use an `@apply` rule:

```css
@apply <mixin-name> [(<argument-list>)]?
```

The `<argument-list>` syntax
can hopefully match the function argument notation,
for positional and named arguments,
and declaration-like `;` delimiters.

When the mixin is resolved,
the output of the mixin
is inserted where the apply rule was called:

```css
/* declaration */
.float-container {
  @apply --clearfix;
}

/* result */
.float-container {
  &::after {
    display: block;
    content: "";
    clear: both;
  }

  @supports (display: flow-root) {
    display: flow-root;

    &::after { display: none; }
  }
}
```

There is an additional question
about how to handle mixin output
at the top level of the document
(not nested inside a selector):

```css
@apply --center-content;
```

As long as there is a selector wrapping the output,
this should not be an issue.
Even if that selector is simply
the parent reference `&`,
that has a well-defined behavior
at the top level of documents --
referring to the current `:scope`.
However, if the result is bare declarations
without any selector,
they should be discarded and ignored.

Another example,
from a Sass mixin I've used on occasion:

```css
@mixin --gradient-text(
  --from: mediumvioletred;
  --to: teal;
  --angle: to bottom right;
) {
  color: var(--from, var(--to));

  @supports (background-clip: text) or (-webkit-background-clip: text) {
    --gradient: linear-gradient(var(--angle), var(--from), var(--to));
    background: var(--gradient, var(--from));
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
  }
}

h1 {
  @apply --gradient-text(pink, powderblue);
}
```

## Detailed discussion and open questions

### Passing nested content to mixins

Another common feature of Sass mixins
is the ability to pass nested content blocks
into a mixin,
and have the mixin place that content
in a specific context.
This seems like a feature
that could be supported in CSS as well,
but would require another mixin-specific at-rule
(or similar placeholder).
I'll call it `@nested` for now:

```css
@mixin --media-medium {
  @media screen and (env(--small) < inline-size < env(--large)) {
    @nested;
  }
}

.grid {
  @apply --media-medium {
    padding: var(--padding-medium, 1em);
  }
}
```

The expected behavior would be
the same as writing:

```css
.grid {
  @media screen and (env(--small) < inline-size < env(--large)) {
    padding: var(--padding-medium, 1em);
  }
}
```

This seems like something that could be added later,
if necessary.

### Invalid function fallbacks

Sadly,
last-takes-precedence `@return` behavior
doesn't provide the same benefit here
that it has in the cascade --
where invalid declarations
can be discarded at parse time,
falling back on previously declared values.
In order to achieve that,
we would need to limit functions
so that they are the only value in a property.
I don't think that tradeoff makes sense
for the use-cases I've seen.

I'm also not sure it makes sense
to provide function-defined fallback values
to return when arguments provided have invalid syntax.
Ideally, function fallbacks
would be modeled after variable fallbacks --
established where the function is called,
rather than where it is defined.
It's hard to see where this would fit
in the proposed syntax.

One option would be a `var()`-like
wrapper function:

```css
button {
  background: fallback(--contrast(pink; 0.7), black);
}
```

We could even use the existing `var()`,
but that would result in functions and custom properties
sharing a single namespace,
which might not be ideal.
Maybe the proposed function for
`first-supported()` would also be an option
that has broader use?
This likely needs more bike-shedding.

### Using parameters in conditional rules

Above,
I used an example with conditional output
using media queries inside the function.
Authors may reasonably wish to take this farther
and use parameters to define the media queries themselves:

```css
@function --media(
  --breakpoint;
  --below;
  --above;
) {
  @media screen and (width < var(--breakpoint)) {
    result: var(--below);
  }
  @media screen and (width >= var(--breakpoint)) {
    result: var(--above);
  }
}
```

This is a very common use of pre-processor mixins,
and a common use-case for the proposed inline `if()`
and `media()` functions as well.

As I understand it,
that will not be possible as written above,
for the same reasons `var()` is not currently allowed
in media-query conditions.
However,
the issues are specific to cascaded values
that need to be resolved at computed value time.
Passing static arguments from a parameter
should not pose the same problem.

If we had a new way of accessing
values passed in --
I'll use `arg()` for the sake of argument --
simple value substitution should be possible:

```css
@function --media(
  --breakpoint;
  --below;
  --above;
) {
  @media screen and (width < arg(--breakpoint)) {
    result: var(--below);
  }
  @media screen and (width >= arg(--breakpoint)) {
    result: var(--above);
  }
}

html {
  /* this works fine, since the argument is accessed with `var()` */
  padding: --media(40em, 0, var(--padding, 1em));

  /* this errors, since the argument is accessed with `arg()` */
  margin: --media(var(--break, 40em), 0, 1em);
}
```

In the above example,
the `padding` declaration
would be valid
since a static value
can be passed along to the media query `arg()` --
but the `margin` declaration would fail
since it supplies a custom property
to a media query condition.

It's not clear to me
if parameters used this way
would need to be explicitly marked in advance
for any reason?
As proposed here,
it would be up to function authors
to document and communicate
which parameters can accept cascading variables,
and which can not.

### Argument conditions and loops

With both mixins and functions
it can be useful to have conditions
based on the arguments passed in.
For example, we might want to pass in
one of several established keywords,
and return a different value
depending which keyword is used:

```css
@function --link(
  --theme: {
    default: dark;
    syntax: "dark | light";
  }
) {
  @when (arg(--theme): light) {
    result: env(--link-light);
  } @else {
    result: env(--link-dark);
  }
}
```

It's not clear to me
if the proposed `@when`/`@else` features
can be adapted to this use-case,
or if it would need to be
a distinct set of similar flow controls.

Similarly,
as we saw in the tint-shade example earlier,
it can be useful to loop over
a set number of repetitions (for loop)
or a set list of items (each loop).

While these would be helpful features for authors,
they are not required for
(or dependent on)
an initial implementation of mixins or functions.
They feel like distinct features
that would go well together.

### Can we allow the `<calc-sum>` syntax?

This question was raised
by [Brandon McConnell](https://github.com/w3c/csswg-drafts/issues/7490#issuecomment-1256880496)
in the 'Declarative Custom Functions' issue
(see point 5, even though it's not specific to recursion).
The goal is to provide custom functions
that take raw calc expressions,
without being explicitly wrapped in a nested
`calc()` function,
similar to the way other math functions work:

```css
.item {
  width: min(100% - 1em, 30em);
}
```

On the one hand,
custom property substitution
makes it trivial to capture expressions,
and later call them inside a `calc()` function.
This already works:

```css
html {
  --l: 100% - 50%;
  background: hsl(0deg 100% calc(var(--l)));
}
```

The only complexity here
is how that logic interacts with
a registered property syntax.
The value `100% - 50%` is not a valid
`<percentage>` value,
while `calc(100% - 50%)` is.
In order to define a parameter
with a registered syntax
that accepts a calculation,
we would need to expose the `<calc-sum>`
grammar as a valid syntax
for authors to use.

It might also be worth considering
what other syntax productions would be useful to expose --
either for parameters specifically,
or for property registration more generally.
It seems ideal to me
if those lists can be kept in alignment.

### What about `@extend`?

In Sass,
mixins without parameters also
overlap with the `@extend` feature,
which is used to combine related classes --
one as an 'extension' of the other.
In most cases,
that has the same intended result
as a no-parameter-mixin:

```css
/* extends */
.error {
  border: thin solid maroon;

  &:hover {
    background-color: #fee;
  }
}

.error--serious {
  @extend .error;
  border-width: thick;
}

/* mixin */
@mixin error {
  border: thin solid maroon;

  &:hover {
    background-color: #fee;
  }
}

.error--serious {
  @include error;
  border-width: thick;
}
```

The difference is that a class definition
can be compiled from multiple rule blocks
in different style sheets,
while a mixin generally has one centralized definition.
This is part of the reason
extensions have become less common in Sass --
it can be difficult to reason about their impact.
For now,
I think mixins would provide the similar functionality
without all the complexity.

### Can functions be chained, or call themselves?

I would expect that it should be possible
to chain function/mixin calls together.
A theme-generating mixin
should be able to reference
a single-color generating mixin or function internally.

It's less clear to me if recursive function calls
are possible or necessary.
There are likely use-cases for recursion
as a form of looping,
but I'm not sure how central they are.

### Keyframe-based mixins for interpolated values?

There has been a lot of recent discussion around
[interpolating values between breakpoints](https://github.com/w3c/csswg-drafts/issues/6245#issuecomment-1715416464)
for e.g. responsive typography.
Conceptually, animation keyframes work well
for defining the steps involved --
but in this case the result is not technically animated,
and interpolated values
should ideally not be removed
to the animation origin.

To get around that,
the most recent proposals
involves a new property
(tentatively `interpolate`)
that would accept a keyframes name
and timeline,
then 'expand in place'
to represent the declarations
in the referenced `@keyframes` rule.

```css
@keyframes typography {
  from {
    font-size: 1.2em;
    line-height: 1.4;
  }
  to {
    font-size: 3em;
    line-height: 1.2;
  }
}

h2 {
  /* declaration, this is all pseudo-code */
  interpolate: typography --container-size ease-in;

  /* result, with interpolated values */
  font-size: /* interpolated… */;
  line-height: /* interpolated… */;
}
```

Alan Stearns has pointed out
in conversations
that this is a very mixin-like behavior,
and suggested treating keyframes
as an existing form of mixin,
rather than a new property.
Given the same keyframes above,
we could consider a syntax like:

```css
h2 {
  /* declaration, this is all pseudo-code */
  @apply typography (--container-size; ease-in);

  /* result, with interpolated values */
  font-size: /* interpolated… */;
  line-height: /* interpolated… */;
}
```

If that clutters the mixin namespace,
another approach might be
requiring dashed-ident mixin names,
and providing some built-in mixins such as:

```css
h2 {
  /* declaration, this is all pseudo-code */
  @apply keyframes(typography; --container-size; ease-in);

  /* result, with interpolated values */
  font-size: /* interpolated… */;
  line-height: /* interpolated… */;
}
```

## Acknowledgments

This proposal is based on
an [existing discussion](https://github.com/w3c/csswg-drafts/issues/7490)
with input from:

- Johannes Odland
- David Baron
- Brian Kardell
- Tab Atkins Jr.
- @jimmyfrasche
- Brandon McConnell
- Lea Verou

I've also incorporated feedback
along the way from:

- Tab Atkins Jr.
- Nicole Sullivan
- Anders Hartvoll Ruud
- Rune Lillesveen
- Alan Stearns
- Yehonatan Daniv
- Emilio Cobos Álvarez
- François Remy
