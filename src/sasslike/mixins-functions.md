---
created: 2023-08-21
title: CSS Mixins and Functions
eleventyNavigation:
  key: mixins-functions
  title: CSS Mixins and Functions
  parent: sasslike
changes:
  - time: 2023-08-22T10:20:26-06:00
    log: Document issues with function fallbacks
  - time: 2023-08-22T13:11:04-06:00
    log: >
      Use semi-colon as argument delimiter,
      and add named arguments
note: >
  This is a rough first-draft
  to capture the goals and potential approaches
  towards CSS-native mixins and functions.
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

### Existing Proposal for Custom Functions

In July of 2022,
Johannes Odland proposed
'[Declarative custom functions](https://github.com/w3c/csswg-drafts/issues/7490)'
in the CSS Working Group issue tracker.
Since then,
the proposal has gone through
several revisions and updates.
Note that:

- Functions would be resolved
  at the same time as variable substitution
- Function parameters defined with a CSSOM 'syntax'
  can be validated at parse time
  (like `@property`-registered variables)
- This would be a declarative version
  of the more full-featured Houdini JS feature

The current (2023-08-08) proposal
uses these examples,
for clamped fluid typography:

```css
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

And for generating a checkerboard:

```css
@custom-function --checkerboard(--size "<length>") {
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

In addition to some bike-shedding of the syntax,
there are several open questions in the thread:

- Can authors provide a fallback output
  when invalid arguments are provided?
- Would it be helpful to include default parameter values
  in the function definition
  (this is already possible in the `var()` syntax,
  when applying the parameters)?
- Can authors define internal custom properties,
  in order to break apart the internal logic?
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
- Some amount of internal logic using `nested-rules`
- A returned `result` value

The proposed syntax
(with a few adjustments)
could look something like:

```
@function <function-name> [( <parameter-list> )]? {
  <nested-rules>

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

I like the `@return` at-rule syntax
rather than a `result` descriptor.

- It helps distinguish
  the final returned value from any internal logic
  like custom properties and nested rules
- Result is not a property,
  but looks a lot like one

Still, either syntax should be able to support
the same basic behavior,
so we can bikeshed the details later.

When multiple `result`s are returned,
we need a way to determine which one is used.
While many languages allow an 'eager'
_first-takes-precedence_ function return,
CSS often uses a _last-takes-precedence_ approach --
both in the cascade of properties,
and to resolve naming conflicts (e.g. keyframes).

Either approach should work here as well,
though I would lean towards the latter
for the sake of consistency.

### Parameter lists

Each `<parameter>`
in the `<parameter-list>`
must have a `<name>`, along with an
optional `<syntax>` (default to universal syntax),
and optional `<initial-value>`
(default to the guaranteed-invalid value).
This matches closely to the needs
of [global property registration](https://github.com/w3c/csswg-drafts/issues/9206),
though working in a more restricted space.

In my mind, it would be great to build on
the way authors currently define most variables --
using the standard property/value declaration syntax.
This would work for `name: initial-value;`
or `name: syntax;` in a straight-forward way,
but has several limitations
when we want to capture both `initial-value` and `syntax`:

- Value parsing is very broad and forgiving,
  making it hard to combine anything with `initial-value`
  on the right (value) side of a declaration
- There's no precedent (yet!) for
  adding more than a name
  to the left (property) side of a declaration
- It should be possible to define any combination
  of `initial-value` and `syntax`
  without requiring either one

On the property side of the equation,
it seems theoretically possible to extend the syntax
with a new delimiter like a space, or parenthesis:

```css
/* in either case */
@function --contrast(
  /* name only, default value & syntax */
  --color;
  --ratio;
) { /* … */ }

/* using parenthesis */
@function --contrast(
  /* name and syntax, default value */
  --color("<color>");
  --ratio("<number>");

  /* name, syntax, and value */
  --color("<color>"): #222;
  --ratio("<number>"): 7;
) { /* … */ }

/* using space */
@function --contrast(
  /* name and syntax, default value */
  --color "<color>";
  --ratio "<number>";

  /* name, syntax, and value */
  --color "<color>": #222;
  --ratio "<number>": 7;
) { /* … */ }
```

On the value side,
it's a bit harder to combine optional
`syntax` with an optional `initial-value`.
It could be done with the `!` delimiter,
which is reserved:

```css
@function --example (
  --my-parameter: initial value !syntax("*");
) { /* … */ }
```

Or, if syntax were required,
it might be possible to make them positional
(though this comes with other risks):

```css
@function --example (
  /* as with var(), any additional commas are part of the initial value */
  --my-parameter: "*", initial value;
) { /* … */ }
```

Another option might be
allowing two forms --
one inline for simple name-and-value descriptions,
and the other with a block
for providing more descriptors:

```css
/* this might need more clarity
   to avoid parsing issues */
@function --example (
  --my-parameter: initial value;
  --another-param {
    initial: 2em,
    syntax: "<length>",
  }
) { /* … */ }
```

As with other matters of syntax,
we can bikeshed the details as necessary.
For this document
I will use the name-plus-parenthesis approach.

## Calling functions

When calling functions,
we may want to allow a similarly broad
syntax for argument values.
In order to achieve that,
we would again use `;` as the argument delimiter:

```css
button {
  background: --contrast(pink; 0.7);
}
```

There is already precedent for this
with built-in functions such as `mix()`
that accept broad-syntax arguments.

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

If positional and named arguments
are allowed in the same function call,
the common convention is to require
all positional values come before any named values
to avoid confusion.

### Nested rules

The `nested-rules` can include custom property declarations
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
on elements where the function is used,
and (maybe less obvious)
custom properties defined or inherited on the element
cannot be referenced in the function.
Any passing of values between the two contexts
would have to be explicit, via provided parameters.

Only custom properties and conditional rules
are useful inside a function definition.
Since functions have no output
besides their returned value,
no-custom properties, nested selectors, and non-conditional rules
are not necessary or meaningful.
They should be ignored and discarded.
I don't think there's any need for these things
to invalidate the entire function.

```css
@function --sizes(
  --s: 1em;
  --m: calc(1em + 0.5vw);
  --l: calc(1.2em + 1vw);
) {
  @media (inline-size < 20em) {
    @return var(--s);
  }
  @media (20em < inline-size < 50em) {
    @return var(--m);
  }
  @media (50em < inline-size) {
    @return var(--l);
  }
}
```

### Putting it all together

Adapting the fluid ratio function above
to my proposed syntax:

```css
@function --fluid-ratio(
  --min-width("<length>"): 300px;
  --max-width("<length>"): 2000px;
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
  --min-width("<length>"): 375px;
  --max-width("<length>"): 1920px;
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
  --min-width("<length>"): env(--fluid-min, 375px);
  --max-width("<length>"): env(--fluid-max, 1920px);
) { /* … */ }
```

## Defining a mixin: the `@mixin` rule

The primary difference
between a mixin and a function
is the level at which they operate.
Rather than returning a single value,
mixins return entire declarations
and potentially entire nested rule blocks.

Much of the function syntax
could be re-purposed,
but the main change would be in how
nested rules and output are handled.

```
@mixin <mixin-name> [( <parameter-list> )]? {
  <nested-rules>
}
```

When there are multiple mixins
that use the same name,
the last mixin with that name
takes precedence.

### Nested rules and output

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
Mixins should be able to both
use internally scoped custom properties,
and output custom properties
as part of the returned rule block.

There are several approaches that might work here
(all names are open to changing):

1. Explicit `@output` rule blocks inside the mixin.
   Anything outside that block is private to the mixin.
2. An `!output` or `!private` flag
   for declaring the availability of individual custom properties.
3. Anything at the top level is private,
   and anything in nested selectors will be output?
   (see 'using mixins' below)

As things stand,
this doesn't seem relevant
to anything other than custom properties.
However, we may want to consider
if there's a chance that would change down the road.

### Applying mixins: the `@apply` rule

In order to apply a mixin,
authors can use the `@apply` rule.
When the mixin is resolved,
the output of the mixin
is inserted where the apply rule was called:

```css
/* input */
.float-container {
  @apply --clearfix;
}

/* output */
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

One potential advantage of option 3 above,
is that it requires mixins always provide
a selector rule block as part of their output.
Even if that selector is simply
the parent reference `&`,
that has a well-defined behavior
at the top level of documents --
referring to the current `:scope`.

The downside would be
that browsers currently
apply nested rules _after_
bare declarations when nesting --
so all mixin output would
have higher cascade source-order priority
than non-mixin declarations.

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

## Detailed discussion and open questions

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
for the use-cases I've seen
(often around specialized or repeated math).

I'm also not sure it makes sense
to provide function-defined fallback values
to return when arguments provided are invalid.
Instead, I would expect function fallbacks
to be modeled after variable fallbacks --
established where the function is called,
rather than where it is defined.

It's hard to see where this would fit
in the proposed syntax,
without using a built-in keyword parameter:

```css
button {
  background: --contrast(pink; 0.7; fallback: black);
}
```

I don't love that solution,
and believe this
deserves more bikeshedding.

### Argument conditions and loops

With both mixins and functions
it can be useful to have conditions
based on the arguments passed in.
For example, we might pass in
one of several established keywords,
and return a different value
depending which keyword is used:

```css
@function --link(
  --theme("dark | light"): dark;
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

### Using parameters in conditional rules

Above,
I used an example with conditional output
using media queries inside the function.
Authors may reasonably wish to take this farther
and use parameters to define the media queries themselves:

```css
@function --media(
  --breakpoint("<length>");
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
  --breakpoint("<length>");
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
