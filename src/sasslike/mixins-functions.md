---
created: 2023-08-21
title: CSS Mixins & Functions Explainer
progress: 👍🏼
tags:
  - explainer
  - mixins-functions
note: >
  👍🏼
  The CSS Working Group has
  [resolved to adopt this proposal](https://github.com/w3c/csswg-drafts/issues/9350#issuecomment-1939628591),
  and begin drafting a new specification
  for CSS Mixins & Functions.
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
    log: Document potential built-in keyframes mixin
  - time: 2023-09-13T10:03:41+02:00
    log: Provide acknowledgments
  - time: 2023-12-01T14:40:11-07:00
    log: Updates to parameter syntax and variable scope
  - time: 2024-02-11T13:20:37-07:00
    log: Changes to variable scope and function result syntax
---

## Author

Miriam Suzanne

(Based heavily on a custom-function proposal by Tab Atkins)

## Intro

In order to reduce code repetition,
ensure consistency across a project,
and encourage best practice,
authors have often turned to third-party
CSS pre-processors
(Sass, Less, PostCSS, Stylus, etc)
to define custom reusable 'macros'.
These generally fall into two categories:

- **Functions** return CSS _values_ --
  like a string, color, or length.
  They can only be used _inside_
  the value space of a CSS property.
- **Mixins** return CSS _declarations_
  or entire _rule blocks_.
  They can only be used _outside_
  the value space of a CSS property.

CSS already provides a wide range
of built-in functions,
such as `calc()`, `minmax()`, and many more.
Ideally, custom functions would work in a similar way,
but prefixed with a dashed-ident
to avoid future compatibility issues.
For a simple example:

```css
@function --negative (--value) {
  result: calc(-1 * var(--value));
}

html { padding: --negative(var(--gap)); }
```

CSS does not yet have built-in mixins,
though several have been proposed
in discussions of this feature.
A simple mixin might look something like this:

```css
@mixin --button (--face, --text, --radius) {
  --background: var(--face, teal);
  --color: color-mix(in lch, var(--text, white) 85%, var(--background));
  --border-color: color-mix(in lch, var(--text, white) 80%, var(--background));

  @result {
    background: var(--background);
    border: medium double var(--border-color);
    border-radius: var(--radius, 3px);
    color: var(--color);
    padding: 0.25lh 2ch;
  }
}

button[type='submit'] { @apply --button(rebeccaPurple); }
button.danger { @apply --button(maroon); }
```

## Discussion

- Discussion on CSSWG Drafts
  [Proposal: Custom CSS Functions & Mixins (#9350)](https://github.com/w3c/csswg-drafts/issues/9350)
- Existing proposal for
  [Declarative custom functions (#7490)](https://github.com/w3c/csswg-drafts/issues/7490)
- Issue tracker
  for this explainer:
  [OddBird CSS Sandbox Issues](https://github.com/oddbird/css-sandbox/issues)

There are several other relevant discussions
in the CSS Working Group,
that predate this proposal:

- [[css-variables-2] Custom shorthands with @property #7879](https://github.com/w3c/csswg-drafts/issues/7879)
- [Declarative custom functions #7490](https://github.com/w3c/csswg-drafts/issues/7490)
- [[css-variables?] Higher level custom properties that control multiple declarations #5624](https://github.com/w3c/csswg-drafts/issues/5624)

(If there are more I haven't found,
please [let me know](https://github.com/oddbird/css-sandbox/issues).)

<!--
..######..##.....##.##.....##.##.....##....###....########..##....##
.##....##.##.....##.###...###.###...###...##.##...##.....##..##..##.
.##.......##.....##.####.####.####.####..##...##..##.....##...####..
..######..##.....##.##.###.##.##.###.##.##.....##.########.....##...
.......##.##.....##.##.....##.##.....##.#########.##...##......##...
.##....##.##.....##.##.....##.##.....##.##.....##.##....##.....##...
..######...#######..##.....##.##.....##.##.....##.##.....##....##...
-->

## Summary & Goals

Features often change
as they move from (generally imperative)
pre-processors into CSS --
taking on different affordances and constraints
appropriate for a declarative,
client-side language:

- How would CSS-native mixins and functions
  differ from pre-processors?
- What extra functionality or limitations
  come from providing these features
  in the browser?

From a language/implementation perspective
mixins and functions
are entirely distinct features --
they live at different levels of the syntax,
and come with different complications.
If we pursue both,
we likely want to define them at
different levels of a specification,
or even in different specifications.

Removing the reliance on pre-processors
would further simplify maintenance for CSS authors,
while providing new client-side functionality:

- Passing cascaded custom-properties as arguments.
- Adding media/support and other client-side conditions.

My goal here is to explore
what would be possible with each feature,
where we could re-use syntax between them,
and how we might move forward
with implementing them.

I am not expecting this to be the final shape
for either feature,
but I want to capture the state of the conversation,
and help move it forward.
If these features are officially
adopted by the working group,
further development can be broken
into individual specs and issues.

<!--
.####.##....##.########.########.########..########..######..########
..##..###...##....##....##.......##.....##.##.......##....##....##...
..##..####..##....##....##.......##.....##.##.......##..........##...
..##..##.##.##....##....######...########..######....######.....##...
..##..##..####....##....##.......##...##...##.............##....##...
..##..##...###....##....##.......##....##..##.......##....##....##...
.####.##....##....##....########.##.....##.########..######.....##...
-->

## Author Interest

There is some (incomplete) data
from the HTTP Archive project
that can help us understand
how authors are using Sass currently:

- [Stats on Scss usage of control flow, conditional logic, nesting, custom functions #5798](https://github.com/w3c/csswg-drafts/issues/5798)

I also ran a small [survey on Mastodon](https://front-end.social/@mia/110833306689188274):

> "What are the most common custom functions or mixins
> that you define/use in a css pre-processor?"

The answers included:

- (Functions) Conversion from pixel to `rem` units
- (Functions) random number generators
- (Functions) Color contrast
- (Mixins) Named shorthands for common media queries
- (Mixins) Generating output from object for-each loops (like Sass Maps)
- (Mixins) Reusable component styles
- (Mixins) Complex solutions, like scroll-shadows or gradient text
- (Both) Fluid typography settings
- (Both) Complex `calc()` shorthands for various situations

Some of these would be possible to achieve
in CSS with a declarative syntax,
without additional new functionality.
Others (like loops) would require imperative control structures.

While some of these (like `random()`)
are already being discussed for built-in functions,
others (like `color-contrast()`)
may be simpler to solve in user-space.
It has been very difficult for the CSSWG
to settle on a long-term solution
for the entire platform,
while an individual team would be
more able to change their approach gradually over time.
By capturing that logic in a single place
(like a custom function),
many changes could be made without
any invasive re-write of the code base.

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

<!--
.########.....###....########.....###....##.....##..######.
.##.....##...##.##...##.....##...##.##...###...###.##....##
.##.....##..##...##..##.....##..##...##..####.####.##......
.########..##.....##.########..##.....##.##.###.##..######.
.##........#########.##...##...#########.##.....##.......##
.##........##.....##.##....##..##.....##.##.....##.##....##
.##........##.....##.##.....##.##.....##.##.....##..######.
-->

## Defining parameters

Both functions and mixins
rely on a `<parameter-list>` syntax.
Each `<parameter>`
in the `<parameter-list>`
consists of three parts:

- `<name>` (required)
  which is a `dashed-ident`
- `<syntax>` (default: `*`)
  similar to the `syntax` descriptor in `@property`
- `<default-value>` (default: `guaranteed invalid`)
  which is any value that matches the syntax

Defining all three aspects in the function prelude
(name, type, and default)
can make the syntax over-complicated.
My initial proposal
included special `@property`-like
descriptor blocks to make that possible.

Since then,
the discussion has moved towards
a more concise approach
using a comma-separated list.

Authors can provide names only:

```css
@function --my-function(--param-a, --another-param) { … }
```

Optionally,
they can also provide a default value:

```css
@function --my-function(
  --param-a: 1em,
  --another-param: 'this is a string'
) { … }
```

{% note %}
Since the list is comma-separated,
this would require
[better handling of arguments with commas](https://github.com/w3c/csswg-drafts/issues/9539)
in CSS.
{% endnote %}

Finally,
authors could define
a syntax for any parameter,
using the `type()` function
along side the name.
This would work with or without default values:

```css
@function --my-function(
  --param-a type(string),
  --another-param type(length): 1em
) { … }
```

<!--
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
-->

## Defining a function: the `@function` rule

In order to define a custom function,
we need several bits of information:

- `function-name` (required)
- `parameter-list` (optional - see above)
- Some amount of internal logic using `function-rules`
- A returned `result` value

The proposed syntax
(with a few adjustments)
could look something like:

```
@function <function-name> [( <parameter-list> )]? {
  <function-rules>

  result: <result>;
}
```

The `function-name` is a dashed-ident.
If multiple functions have the same name,
then functions in a higher cascade layer take priority,
and functions defined later have priority
within a given cascade layer.
This matches the behavior of other name-defining at-rules.

It may also be useful to define an intended 'return type'
(e.g. `color` or `length`) for the function,
so that it can be validated at parse time.
Like custom properties,
there is still a chance that a function's output
will be _invalid at computed value time_,
but we can at least ensure that
the function is intended to return an appropriate syntax
for the context where it is being called.

Extending the above syntax,
I would imagine re-using the `type()` function
in the prelude:

```
@function <function-name> [( <parameter-list> )]? [returns type(<syntax>)]? {
  <function-rules>

  result: <result>;
}
```

I would expect `<syntax>` to allows the same
[subset of CSS Types](https://developer.mozilla.org/en-US/docs/Web/CSS/@property/syntax#values)
provided by the `syntax` descriptor of the `@property` rule.
Maybe it would be possible to remove
the requirement for quotes around a syntax in this context?

### Returning values

There have been several syntax options discusses
for returning a `<result>` value,
but it seems to me like the simplest
and most familiar would be a descriptor
called something like `result` or `output`.
This would help re-enforce
the declarative nature of functions,
since it can be treated similar to other declarations:
the last `result` is used if multiple are present.

Like custom properties:

- The `<result>` can contain any valid CSS value-space syntax
- This value has `invalid at computed value time` behavior

Since functions exist in the value space,
`<function-rules>` will not contain any other
(non-custom) CSS properties,
so the single `result` descriptor should stand out.
If multiple results are encountered,
the last result takes precedence
(consistent with other descriptors and properties).
This is discussed in more detail below.

{% note %}
Tab covers
[declarative execution in the CSSWG issue](https://github.com/w3c/csswg-drafts/issues/9350#issuecomment-1930463996)
with a bit more detail.
{% endnote %}

### Function rules

The `<function-rules>` can include custom property declarations
(which are scoped to the function),
as well as conditional at-rules
(which may contain further nested
custom properties and `result`s).
Element-specific conditions (such as container queries)
would be resolved for each element that calls the function.

My assumption
would be that custom properties
defined inside the function
are not available
on elements where the function is called.
However, it's clear that authors will expect
to reference external custom properties
from inside functions --
using some variation of dynamic scope,
and 'shadowing' behavior.

As far as I can tell,
only custom properties, args/variables,
and conditional rules
are useful inside a function definition.
Functions have no output
besides their returned value,
so nested selectors, built-in properties,
and name-defining rules
are not necessary or meaningful.
I don't think there's any need for these things
to invalidate the entire function,
but they should be ignored and discarded.

An example function
using conditional rules
to return one of multiple values:

```css
@function --sizes(
  --s type(length),
  --m type(length),
  --l type(length),
) returns type(length) {
  --min: 16px;

  @media (inline-size < 20em) {
    result: max(var(--min), var(--s, 1em));
  }
  @media (20em < inline-size < 50em) {
    result: max(var(--min), var(--m, 1em + 0.5vw));
  }
  @media (50em < inline-size) {
    result: max(var(--min), var(--l, 1.2em + 1vw));
  }
}
```

Some functions will also want access to
contextual variables
on the calling elements.
To avoid fully dynamic scoping
of custom properties,
Tab has proposed a second list
of properties that should be available
in the function:

```css
@function --my-function (--arg1, --arg2) using (--var1, --var2) {
  /* --arg1 and --arg2 can be provided as arguments */
  /* --var1 and --var2 will shadow identically-named variables
     in the calling context */
}
```

{% note %}
Tab covers
[variable scoping in the CSSWG issue](https://github.com/w3c/csswg-drafts/issues/9350#issuecomment-1930463996)
with a bit more detail.
{% endnote %}

### Calling functions

Custom functions can be called
from the value space of any property,
with the name of the functions,
followed by parenthesis and
a comma-separated list of arguments:

```css
button {
  background: --contrast(pink, 0.7);
}
```

If we do (eventually) want to support named arguments,
it would ideally use a familiar
declaration syntax:

```css
button {
  background: --contrast(--color: pink; --ratio: 0.7);
}
```

If positional and named arguments
are allowed in the same function call,
the common convention is to require
all positional values come before any named values
to avoid confusion:

```css
button {
  background: --contrast(pink; --ratio: 0.7;);
}
```

We need to allow a broad
syntax for argument values --
including values that contain commas.
There's an active discussion
about the best way to handle this
more generally in
[issue #9539](https://github.com/w3c/csswg-drafts/issues/9539).
Custom functions should use whatever solution
is agreed on there.

### Putting it all together

Adapting the fluid ratio function above
to the proposed syntax:

```css
@function --fluid-ratio(
  --min-width type(length),
  --max-width type(length),
) returns type(percentage) {
  --min: var(--min-width, 300px);
  --max: var(--max-width, 2000px)l
  --scale: calc(var(--max) - var(--min));
  --position: calc(100vw - var(--min));
  --fraction: calc(var(--position) / var(--scale));

  @return clamp(
    0%,
    100% * var(--fraction),
    100%
  );
}

p {
  font-size: calc-mix(--fluid-ratio(375px; 1920px), 1rem, 1.25rem);
  padding: calc-mix(--fluid-ratio(375px; 700px), 1rem, 2rem);
}
```

We could also consider moving the `mix()` logic
into the function:

```css
@function --fluid-mix(
  --min-value type(length),
  --max-value type(length),
  --from-width type(length),
  --to-width type(length)
) returns type(length) {
  --from: var(--from-width, var(--fluid-min, 375px));
  --to: var(--to-width, var(--fluid-max, 1920px));
  --scale: calc(var(--to) - var(--from));
  --position: calc(100vw - var(--from));
  --fraction: calc(var(--position) / var(--scale));
  --progress: clamp(0%, 100% * var(--fraction), 100%);

  @return calc-mix(var(--progress), var(--min-value), var(--max-value));
}

p {
  font-size: --fluid-mix(1rem, 1.25rem);
  padding: --fluid-mix(1rem, 2rem, 375px, 700px);
}
```

<!--
.##.....##.####.##.....##.####.##....##..######.
.###...###..##...##...##...##..###...##.##....##
.####.####..##....##.##....##..####..##.##......
.##.###.##..##.....###.....##..##.##.##..######.
.##.....##..##....##.##....##..##..####.......##
.##.....##..##...##...##...##..##...###.##....##
.##.....##.####.##.....##.####.##....##..######.
-->

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

This approach doesn't allow
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
we could explicitly mark
blocks of content
with either `@output` or `@private` at-rules.

### Applying mixins: the (new) `@apply` rule

In order to apply a mixin,
we use an `@apply` rule:

```css
@apply <mixin-name> [(<argument-list>)]?
```

The `<argument-list>` syntax
should ideally match the function argument notation.

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
  --from-color type(color),
  --to-color type(color),
  --at-angle type(angle),
) {
  --to: var(--to-color, teal);
  --from: var(--from-color, mediumvioletred);
  --angle: var(--at-angle, to bottom right);
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

<!--
.##..........###....##....##.########.########...######.
.##.........##.##....##..##..##.......##.....##.##....##
.##........##...##....####...##.......##.....##.##......
.##.......##.....##....##....######...########...######.
.##.......#########....##....##.......##...##.........##
.##.......##.....##....##....##.......##....##..##....##
.########.##.....##....##....########.##.....##..######.
-->

## Layers of complexity

The popular Sass functions and mixins
demonstrate a range of different input needs,
from relatively static shorthands,
to fully imperative control structures.

### Simple shorthands

A `clearfix` mixin
often has no exposed 'parameters',
and no internal logic.
When the mixin is invoked,
it will output
the same code every time.
This is useful for maintaining
DRY code (Don't Repeat Yourself),

Static mixins like this
end up very similar to
'utility classes' such as `.clearfix`.
However, mixins still have the advantage
that they can be applied in CSS,
rather than HTML.
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

Most of the existing proposals around this use-case
would combine conditional logic
with selector logic,
so that both can be defined at once.
In Sass, we might fix this instead
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

Using Container Style Queries
might also be an option here.
They can be somewhat _mixin-like_,
but come with all the limitations
of container queries.
If we set a custom property `--mode`
on the root `html` element,
we have to assign properties on a different element
than we query:

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

That can cause several problems:

- There are optimizations and features specific to the root,
  that can't be replicated on other elements.
- In other component contexts,
  it's likely to require extra markup.

While no-parameter mixins like these
are somewhat common,
it's much less common to have a
function without parameters,
since a simple value
can be captured in a variable
or custom property instead.

### Built-in conditions

It can also be useful to provide mixins
that have no author-facing parameters,
but still contain internal logic and conditional statements --
using `@supports`, `@media`, or `@container`:

```scss
@mixin gradient-text {
  color: teal;

  @supports (background-clip: text) or (-webkit-background-clip: text;) {
    background: linear-gradient(to bottom right, teal, mediumvioletred);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
  }
}
```

A mixin like this might even
reference external values
by relying on custom properties
without accepting explicit override parameters:

```scss
@mixin gradient-text {
  --gradient-text-start: var(--color-primary, teal);
  --gradient-text-end: var(--color-complement, mediumvioletred);
  color: var(--gradient-text-start);

  @supports (background-clip: text) or (-webkit-background-clip: text;) {
    background: linear-gradient(
      to bottom right,
      var(--gradient-text-start),
      var(--gradient-text-end)
    );
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
  }
}
```

### Accepting parameters

The most common reason
to use a function or mixin
is the ability to define parameters
that alter the output
based on different input.
For example, a
`darken()` function
would accept two parameters:
a color,
and an amount to darken that color.

In many cases (like `darken()`)
the internal function logic
can be represented by an inline calculation
using existing CSS features.
In those situations,
a custom function could still provide
more concise and easy-to-use shorthand
around a more complex `calc()`
or relative color adjustment.

### Parameter conditions

Once we allow both parameters
and conditional logic,
the next step would be to allow
parameters to be used in the conditions themselves.
For example:

```css
@mixin button(--style: outline, --shape: pill) {
  @when arg(--style: outline) {
    border: medium solid;
    color: teal;
  } @else {
    background: teal;
    color: white;
  }

  @when arg(--shape: pill) {
    border-radius: 50%;
  }
}
```

### Imperative control flow

Some use-cases require
more complex 'flow control'
such as loops.
For example,
a combination of mixins might generate
a full color-palette
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

I think it would be reasonable
to draw a boundary here,
since CSS is a declarative language.
Adding imperative flows
would likely cause confusion around the execution model.

<!--
.########..########.########....###....####.##........######.
.##.....##.##..........##......##.##....##..##.......##....##
.##.....##.##..........##.....##...##...##..##.......##......
.##.....##.######......##....##.....##..##..##........######.
.##.....##.##..........##....#########..##..##.............##
.##.....##.##..........##....##.....##..##..##.......##....##
.########..########....##....##.....##.####.########..######.
-->

## Detailed discussion and open questions

### Other result syntaxes for functions

Both Lea and I have noted that
it would be useful
if authors could rely on cascade
'order of appearance'
to provide 'fallback' return values.
Sadly, however,
that sort of parse-time fallback
is not possible with dynamic
computed-value-time features
like custom properties or functions.

I initially proposed an at-rule syntax (`@return`),
arguing that:

- It helps distinguish
  the final returned value from any internal logic
  like custom properties and nested rules
- Result is not a property,
  but looks a lot like one

However, `result`
does act like a property in many ways,
and would help to re-enforce
our familiarity with declarative execution.
While many imperative languages
allow an 'eager' _first-takes-precedence_ function return,
CSS and other declarative languages
generally uses a _last-takes-precedence_ approach.
For the same reason,
we should avoid active words like `return`
that suggest the evaluation is linear
and can be cut short.

François Remy
has proposed setting a custom property
with the same name as the function,
and that property is treated as the resulting value.
Lea Verou suggested making the property name
customizable in the prelude.

I prefer a syntax that is more consistent and reliable.
I don't see any utility that comes from
allowing this functionality to be renamed in each function,
or requiring that name to be determined by authors,
or putting it in the author's custom-ident name space.
Those all seem to me like ways of inviting typos and confusion,
without any clear gain.

Matching the function name
seems to me extra fragile --
as you could never rename one
without also updating the other.
Still,
either approach could work,
and provide the same basic behavior.
We can continue to bike-shed the details.

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
  --breakpoint: length,
  --below: length,
  --above: length
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
  --breakpoint: length,
  --below: length,
  --above: length
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
  --theme: *;
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

To take it farther,
we would need to expose the `<calc-sum>`
grammar as a valid syntax
for authors to use.

It might also be worth considering
what other syntax/types would be useful to expose --
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
without the same complexity.

If we are interested in exploring `@extend` at some point,
Tab has already written an
[unofficial draft specification](http://tabatkins.github.io/specs/css-extend-rule/)
that we can build from.

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
This doesn't seem like a feature requirement in level 1.

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
  /* mixin, this is all pseudo-code */
  @apply typography(--container-size; ease-in);

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

<!--
.########..########..####..#######..########........###....########..########
.##.....##.##.....##..##..##.....##.##.....##......##.##...##.....##....##...
.##.....##.##.....##..##..##.....##.##.....##.....##...##..##.....##....##...
.########..########...##..##.....##.########.....##.....##.########.....##...
.##........##...##....##..##.....##.##...##......#########.##...##......##...
.##........##....##...##..##.....##.##....##.....##.....##.##....##.....##...
.##........##.....##.####..#######..##.....##....##.....##.##.....##....##...
-->

## Prior art

### The `@apply` Rule (abandoned)

{% note 'Links' %}
[Why I abandoned `@apply`](https://www.xanthir.com/b4o00)
by **Tab Atkins-Bittner**
{% endnote %}

At one point,
there was a plan
for custom properties to act as a form of mixin,
using the `@apply` rule.
That proposal was abandoned
as the wrong approach
for several related reasons:

- Custom properties are value-level syntax,
  while mixins are declaration-level
- It doesn't make sense for mixin definitions
  to be passed around in the cascade

These are not difficult issues to avoid.
I'm working from the premise that:

- Both function and mixins
  should be _defined_ globally,
  and not rely on any element-aware
  aspects of the cascade.
- Similar to e.g. `@keyframes`,
  function and mixin definitions
  would still resolve name conflicts
  using global cascade features
  like _layers_ and _order of appearance_.
- Functions are applied in the _value_ space,
  while mixins are applied in the _declaration_ space.

### Container Style Queries (partially implemented)

{% note 'Links' %}
[CSS Containment Module Level 3](https://www.w3.org/TR/css-contain-3/#style-container)
{% endnote %}

The `style()` feature of `@container`
can sometimes be used to approximate mixin behavior.
There are several recent
[posts](https://front-end.social/@chriscoyier/110821892737745155)
and [articles](https://chriskirknielsen.com/blog/future-themes-with-container-style-queries/)
written about that approach.
However, style queries
share the limitation of other container queries:
_we can't style the container being queried_.

Container queries are designed
as a _conditional selector_ mechanism,
for responding to changes in context.
The ancestor/descendant limitation
is required for browsers to separate
selector-matching from value-resolution
on a given element.

However, _mixins do not alter selection_,
they only 'bundle' existing CSS rules and declarations for re-use.
Ideally, these two features should work well together,
so that contextual conditions
can change the arguments passed to a given mixin.

### Custom Properties (implemented)

{% note 'Links' %}
[CSS Custom Properties In The Cascade](https://www.smashingmagazine.com/2019/07/css-custom-properties-cascade/)
by **Miriam Suzanne**
{% endnote %}

We can also use custom properties to
approximate some basic mixins and functions.
While these tricks can be useful,
they involve significant complexity,
caveats, and limitations:

- Each 'function/mixin' and 'argument' is a custom property,
  which can only have a single resolved value per element
- Arguments are substituted in the function/mixin
  _before the computed value inherits_,
  so the logic has to be defined
  on every element that should re-calculate a result

### Mixins and functions in pre-processors

{% note 'Links' %}
- [Sass `@function` documentation](https://sass-lang.com/documentation/at-rules/function/)
- [Sass `@mixin`/`@include` documentation](https://sass-lang.com/documentation/at-rules/mixin/)
{% endnote %}

In addition to parameters,
Sass mixins can accept _content blocks_.
An example [from the documentation](https://sass-lang.com/documentation/at-rules/mixin/#content-blocks):

```scss
@mixin hover {
  &:not([disabled]):hover {
    @content;
  }
}

.button {
  border: 1px solid black;
  @include hover {
    border-width: 2px;
  }
}
```

That might be a useful feature
for CSS mixins as well.
It would be required for the use-case
of creating named conditions.
That use-case may also be solved by the proposed
`@when` rule and 'custom media queries' feature.

Sass provides some built-in core functions,
but (so far) does not provide core mixins.
Likely for that reason,
the HTTP Archive report lists
several commonly-used built-in functions
(`if()`, and `darken()`),
but only the most commonly used
custom mixin name (`clearfix`).

### Existing Proposal for Custom Functions

In July of 2022,
Johannes Odland proposed
'[Declarative custom functions](https://github.com/w3c/csswg-drafts/issues/7490)'
in the CSS Working Group issue tracker.
Since then,
the proposal has gone through
several revisions and updates.

The current (2023-08-08)
proposal in that thread
suggests that:

- Functions would be resolved
  at the same time as variable substitution
- Function parameters defined with a CSSOM 'syntax'
  can be validated at parse time
  (like `@property`-registered variables)
- This would be a declarative version
  of the more full-featured Houdini API feature

There are also several example use-cases,
such as this function
for fluid typography:

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

{% warn 'Unit division in math functions', 'closed' %}
  In addition to the new syntax proposed here,
  browsers would also need to implement
  [unit-division in math functions](https://drafts.csswg.org/css-values/#calc-type-checking)
  for this use-case to work as shown.
{% endwarn %}

Or a function for
generating checkerboard background-images:

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
While that might be a useful first-step,
it quickly falls short of the use-cases I've seen.
I would prefer to start with a more fully-featured approach,
and work backwards to an attainable level 1 implementation
if needed.

In addition to some bike-shedding of the syntax,
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

<!--
.##.....##.########.########....###...
.###...###.##..........##......##.##..
.####.####.##..........##.....##...##.
.##.###.##.######......##....##.....##
.##.....##.##..........##....#########
.##.....##.##..........##....##.....##
.##.....##.########....##....##.....##
-->

## Acknowledgments

This proposal is based on
an [existing discussion](https://github.com/w3c/csswg-drafts/issues/7490)
with input from:

- Johannes Odland
- David Baron
- Brian Kardell
- Tab Atkins-Bittner
- @jimmyfrasche
- Brandon McConnell
- Lea Verou

I've also incorporated feedback
along the way from:

- Nicole Sullivan
- Anders Hartvoll Ruud
- Rune Lillesveen
- Alan Stearns
- Yehonatan Daniv
- Emilio Cobos Álvarez
- François Remy
- Steinar H Gunderson
- Matt Giuca

## Todo

- [Defer mixin-nested selectors](https://github.com/w3c/csswg-drafts/issues/9350#issuecomment-1717661703)
  as [potentially expensive](https://github.com/w3c/csswg-drafts/issues/9350#issuecomment-1723337386)
- [Clarify recursion limitations](https://github.com/w3c/csswg-drafts/issues/9350#issuecomment-1719603753)
- [Clarify static vs dynamic args](https://github.com/w3c/csswg-drafts/issues/9350#issuecomment-1720836487)
