---
draft: 2023-08-15
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
  - An optional `parameter-default-value`
- Some amount of internal logic using `nested-rules`
- A returned `result` value

The proposed syntax
(with a few adjustments)
could look something like:

```
@function <function-name> [( <parameter-list> )]? {
  <nested-rules>

  result: <result>;
}
```

The `function-name` is a dashed-ident.
If multiple functions have the same name,
then functions in a higher cascade layer take priority,
and functions defined later have priority
within a given layer.

### Return values

The specified `<result>` value can
accept the same broad CSS syntax as custom property values.
At computed value time,
that output can be resolved and validated
against the property that called the function.

On first glance,
I like the alternative `@return` at-rule syntax
rather than a `result` descriptor.

- It helps distinguish
  the final returned value from any internal logic
  like custom properties and nested rules
- Result is not a property,
  but looks a lot like one

However, the fallback behavior proposed below
is more familiar in CSS properties/descriptors --
and less common in imperative languages like Sass
(which uses `@return`) or JS (which uses `return`).
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

In the cascade,
that approach serves another purpose:
authors can provide fallback values first,
and then override those values
in any browser that supports the override:

```css
html {
  background-color: #0f0;
  /* browsers without p3 support will ignore this */
  background-color: color(display-p3 0 1 0);
}
```

But this fallback behavior is handled at _parse time_,
and the unknown declaration
is immediately discarded.
That makes the same behavior impossible
using custom properties,
which only become _invalid at computed value time_
(after the cascade has completed).
By the time the variable is invalidated,
the previous property has already been discarded:

```css
html {
  --p3-green: color(display-p3 0 1 0);
  /* this value is discarded at parse time */
  background-color: #0f0;
  /* this property is used even when p3 colors are not supported */
  /* browsers without p3 support treat it as `unset` */
  background-color: var(--p3-green);
}
```

Custom functions may provide a workaround for this,
by allowing fallback `result` values --
all of which are validated at computed value time,
without some being discarded at parse time:

```css
@function --try(
  --ideal "*";
  --fallback "*";
) {
  result: var(--fallback);
  result: var(--ideal);
}

html {
  background-color: --try(var(--p3-green), #0f0);
}
```

Since custom functions are also resolved
at computed value time,
both possible results can be resolved
as part of that process --
and validated against the property calling the function
(e.g. `background-color`).

{% note %}
  The CSS Working Group
  [has already approved](https://github.com/w3c/csswg-drafts/issues/5055#issuecomment-1022425917)
  a `first-valid()` function like this,
  which has not been implemented.
{% endnote %}

In addition to browser support fallbacks,
this behavior could also
solve the earlier question
about providing a fallback result
when given invalid arguments.
Authors could provide an initial `result`
that does not rely on the arguments provided,
and get that returned value
when others fail.

### Nested rules

The `nested-rules` can include custom property declarations
(which are scoped to the function),
as well as conditional at-rules
(which may contain further nested
custom properties and `@return` values).
Element-specific conditions (such as container queries)
are resolved for each element that calls the function.

Only custom properties and conditional rules
are useful within a function.
I would expect any other (non-custom property) declarations
and (non-conditional) rules
to be ignored and discarded
without invalidating the entire function.

### Parameter lists

Each `<parameter>`
in the `<parameter-list>` needs to have a
`<name>`, and `<syntax>` --
along with an optional `<default-value>`
(otherwise fall-back to the guaranteed-invalid value).
There's no clearly established way
to associate three parameter parts like this,
but we do have an existing syntax
for associating custom property names and values.
By using that established declaration syntax
with `:` between name and value,
and `;` as the delimiter between parameters,
we can allow any valid CSS values as defaults --
even when commas are present in the default value.

From that baseline,
the primary question is where/how
to capture the parameter `<syntax>`.
Since the value-side of a declaration (right side)
is extremely permissive,
I would suggest adding syntax rules
to the property/name (left) side of the colon.
For example, neither space nor parenthesis characters
are allowed in an ident token,
and could be used to separate name from syntax rules:

```css
/* using parenthesis */
@function --contrast(
  /* if <syntax> is optional, accept name only */
  --color;
  --ratio;

  /* name and syntax, no default value */
  --color("<color>");
  --ratio("<number>");

  /* name <syntax>: default */
  --color("<color>"): #222;
  --ratio("<number>"): 7;
) { /* … */ }

/* using space */
@function --contrast(
  /* if <syntax> is optional, accept name only */
  --color;
  --ratio;

  /* name and syntax, no default value */
  --color "<color>";
  --ratio "<number>";

  /* name <syntax>: default */
  --color "<color>": #222;
  --ratio "<number>": 7;
) { /* … */ }
```

Adapting the fluid ratio function above
to my proposed syntax
might looks like this:

```css
@function --fluid-ratio(
  --min-width "<length>": 300px;
  --max-width "<length>": 2000px;
) {
  --scale: calc(var(--max-width) - var(--min-width));
  --current: calc(100vw - var(--min-width));
  --fraction: calc(var(--position) / var(--scale));

  result: clamp(
    0%,
    100% * var(--fraction),
    100%
  );
}
```

My assumption here
would be that custom properties
defined inside the function
are not available
on elements where the function is used,
and (maybe less obvious)
custom properties defined or inherited on the element
can not be referenced in the function
unless explicitly provided as arguments:

```css
.example {
  /* these values are not available in the function */
  --min-width: 200px;
  --max-width: 960px;

  /* default values are used for min and max width parameters */
  font-size: mix(--fluid-ratio(), 1.5em, 3em);

  /* arguments have to be passed in explicitly */
  line-height: mix(
    --fluid-ratio(var(--min-width), var(--max-width)),
    1.4,
    1.2
  );
}
```

Since functions have no output
besides their returned value,
normal (non-custom) properties
inside a function are ignored,
and have no effect.
Nested selectors and name-defining at-rules
are similarly ignored,
along with anything inside them.
However, conditional rules are resolved
as though nested
in the location where the function is called.
This allows adjusting the function logic
based on conditions surrounding an element:

```css
@function --sizes(
  --s "<length>": 1em;
  --m "<length>": calc(1em + 0.5vw);
  --l "<length>": calc(1.2em + 1vw);
) {
  @media (inline-size < 20em) {
    result: var(--s);
  }
  @media (20em < inline-size < 50em) {
    result: var(--m);
  }
  @media (50em < inline-size) {
    result: var(--l);
  }
}
```

### Using parameters in conditional rules

Authors may reasonably wish to take this farther
and use parameters to define the media queries themselves:

```css
@function --media(
  --breakpoint "<length>";
  --below "*";
  --above "*";
) {
  @media screen and (width < var(--breakpoint)) {
    result: var(--below);
  }
  @media screen and (width >= var(--breakpoint)) {
    result: var(--above);
  }
}
```

This is a very common use of mixins,
and a common use-case proposed for inline `if()`
and `media()` functions.

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
  --breakpoint "<length>";
  --below "*";
  --above "*";
) {
  @media screen and (width < arg(--breakpoint)) {
    result: var(--below);
  }
  @media screen and (width >= arg(--breakpoint)) {
    result: var(--above);
  }
}

html {
  padding: --media(40em, 0, var(--padding, 1em));
  margin: --media(var(--break, 40em), 0, 1em);
}
```

Unlike `var()`,
the `arg()` function
would be resolved eagerly,
without needing to fully cascade and resolve
custom properties.
In the above example,
the `padding` declaration
would be valid
since a static value
can be passed along to the media query `arg()` --
but the `margin` declaration would fail
since it supplies a custom property
to a media query condition.

It's not clear to me
if that behavior would also be useful/necessary
to define as part of describing
the parameter list initially.
As proposed here,
it would be up to function authors
to document and communicate
which parameters accept variables,
and which do not.

## Detailed discussion and open questions

### Can a parameter accept a `<calc-sum>` syntax?

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
