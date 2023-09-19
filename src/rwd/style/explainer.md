---
title: CSS Style Query Explainer
created: 2022-11-21
tags:
  - explainer
---

## Authors

Miriam Suzanne

## Participate

These features are already defined in the
[CSS Containment Module Level 3 Working Draft][wd].

[wd]: https://drafts.csswg.org/css-contain-3/#style-container

Initial CSSWG issues:

- [What container features can be queried? #5989](https://github.com/w3c/csswg-drafts/issues/5989)
- [Define a syntax for style-based container queries #6396](https://github.com/w3c/csswg-drafts/issues/6396)

Currently open CSSWG issues:

- [Higher level custom properties that control multiple declarations #5624][higher-level]
- [Should style() queries allow !important flag? #7413](https://github.com/w3c/csswg-drafts/issues/7413)
- [Move style queries of standard properties to level 4 #7185](https://github.com/w3c/csswg-drafts/issues/7185)
- [Add ability to test for at-rule preludes #6966](https://github.com/w3c/csswg-drafts/issues/6966)

[higher-level]: https://github.com/w3c/csswg-drafts/issues/5624

Deferred issues for level 4:

- [Extend style query syntax? #7068](https://github.com/w3c/csswg-drafts/issues/7068)
- [Define a syntax for state-based container queries #6402](https://github.com/w3c/csswg-drafts/issues/6402)

Related links:

- [Request for TAG review](https://github.com/w3ctag/design-reviews/issues/787)
- [Article & Use-Cases by Una Kravets](https://una.im/style-queries/)

## Introduction

In a world of design systems and custom components,
authors need a way to define simple parameters
that control multiple properties.
The current workaround
used by many web component authors
is to define custom attributes (often `data-*`)
that are passed in via HTML.

However, the [TAG guidelines](https://w3ctag.github.io/webcomponents-design-guidelines/#:~:text=Don%E2%80%99t%20use%20custom%20attributes%20for%20styling)
state that custom attributes should not be used for styling,
and authors should rely on custom properties instead.
While it's true in theory that custom properties would be
a better solution --
since they exist entirely in CSS,
and cascade the same as other style properties --
custom properties are currently limited to
carrying a single value.
It's hard to achieve any more complex
impact on other properties,
beyond simple substitution.

Meanwhile, container queries
allow authors to 'query'
some set of conditions on an ancestor element,
in the same ways that media queries
allow us to query various conditions
of the overall viewport, browser, and interface.

Also similar to media queries,
the majority of discussion
has historically focussed on
[size-based queries](https://css.oddbird.net/rwd/query/explainer/) —
especially the width of the viewport or container.
But much like
device-interface and user-preference media queries,
there are a number of other powerful
'container features' that
would be useful to query.
We've categorized these roughly
into two types:

1. [Style features](https://github.com/w3c/csswg-drafts/issues/6396)
   (already specified in
   [CSS Containment Level 3](https://www.w3.org/TR/css-contain-3/#style-container))
   allow querying
   the _computed styles_ of a container.
2. [State features](https://github.com/w3c/csswg-drafts/issues/6402)
   would allow querying various aspects of
   the container's current state —
   such as a `position:sticky` container
   being currently 'stuck',
   or an `overflow:auto` container
   currently 'overflowing'.
   These feature would likely need to be defined
   one-at-a-time, and require more research.

This document is an explainer of possible
container query style features,
which would allow authors to use
custom properties (and existing properties)
to create higher-level
patterns and controls.

## Goals

The goal of this proposal
is to allow authors to define conditional rules
based on their container context --
and the cascaded/computed values
of container properties.
For example:

- Custom properties should be able
  to have a [broader impact on styles][higher-level],
  rather than simply holding value fragments to be applied later.
  By querying the value of a custom property,
  authors can define that broader impact
  directly in CSS.
- Authors often define and apply
  explicit selector hooks (classes and attributes) in the DOM,
  in order to represent 'current style context'
  (such as an element having light or dark background).
  It would be more direct to query those styles explicitly,
  and keep all the logic in CSS.

This proposal aims to give authors
those tools, such that the resulting conditional styles:

- Can apply to more than one property
  without unnecessary repetition of the condition.
- Don't require an explicit inline fallback,
  but can fallback to values defined outside the condition.

Neither of those is possible to achieve
with inline conditional statements.

## Non-goals

In some use-cases,
authors only want to change a single property
based on an inherited style.
For example,
an author may want to un-italicize
the `em` element
when the context is already italic.
While that's possible
using the container query syntax proposed here,
an [inline conditional](https://github.com/w3c/csswg-drafts/issues/5009#issuecomment-626072319)
or [`toggle()`](https://drafts.csswg.org/css-values-5/#funcdef-toggle) function
is likely to provide
better ergonomics.

Ideally authors would have
both inline-value and at-rule level syntax available
for conditional statements --
and the two should integrate smoothly where possible.
However, this proposal
is entirely focused on the block level solution.

It's also likely that we will want
to provide additional style query features,
particularly range-based style queries
(e.g. `(padding-inline > 1em)`),
or arbitrary style comparisons
(e.g. `(padding-inline > margin-inline)`
or `(1em > 2vw)`).
See [issue #7068 in csswg-drafts](https://github.com/w3c/csswg-drafts/issues/7068),
which has been deferred to level 4 of the specification.

In the meantime,
we think the basic computed-value match
provides a powerful first version of the functionality,
while avoiding some of the more difficult questions.
Equality comparisons for computed values
are already well-defined,
and give us a framework to build on.

## Proposed solutions

Container queries work
by defining _container_ elements
on the page,
and then allowing their descendent elements
to apply _conditional styles_
based on their ancestor containers.

The initial release of this feature
(now available in Blink and WebKit browsers)
was primarily interested in
size-based or _dimensional_ query features --
containing the size/layout of the container,
so that we can measure and respond to
it's height, width, aspect ratio, or orientation.

At the same time
(and in [the same specification][wd])
we left room for additional container/query types,
and defined the following syntax for
_container query style features_.

### Querying computed styles: `@container style()`

The container query syntax
relies on the `@container` rule:

```css
@container <name>? <conditions> {
  /* conditional styles */
}
```

For dimensional queries,
that often looks very similar to a media query:

```css
@container layout (min-width: 30em) {
  .card { padding: 1em; }
}
```

However, the condition has to be resolved
individually for each element
matched by a selector (e.g. `.card`)
inside the query.
For each matched element,
we determine the proper container to query
by filtering ancestor elements for:

- A `container-name` that matches
  the requested name, if specified
  (in this case `layout`)
- A `container-type` that is able to
  handle the given conditions
  (in this case `size` or `inline-size`)

If a container is found,
the conditions are resolved against that container.
If multiple containers are found,
the 'nearest' relative container takes precedence.
If no container is found,
the query returns `unknown`
(similar to `false`, but also `false` when negated).

Style queries would use
the same underlying syntax and logic,
but differentiated by a `style()` function syntax,
which accepts any valid style declaration:

```css
@container style(font-style: italic) {
  em {
    background: var(--highlight);
    color: var(--highlight-text);
  }
}

@container style(--button: pill) {
  button {
    border-radius: 50%;
    padding-inline: 1em;
  }
}

@container colors style(background-color: black) {
  a:any-link {
    color: var(--link-on-dark);
  }
}
```

Since we are comparing _computed values_,
we can use custom properties and relative units
on either side of the condition declaration --
and the replaced values will be used for comparison:

```css
/* --bg-dark is resolved on the container before comparing values */
@container theme style(background-color: var(--bg-dark)) {
  a:any-link { color: powderblue; }
}
```

Style conditions that query a shorthand property
are true if the computed values match
for each of its longhand properties.

### Defining style containers: `container-type` and `container-name`

Dimensional queries
require css _containment_
on the size, layout, and style
of the container
in order to prevent layout loops.
Containment is an invasive thing to apply broadly,
so it was important that authors
have careful control over what elements
are (or are not) size containers.

Style-based queries don't have the same limitation.
There is already no way in CSS
for descendant styles to have an impact
on the computed styles of an ancestor.
So no containment is required,
and there are no invasive or unexpected side-effects
in establishing an element as a _style query container_.

Still, there are two important
(and somewhat distinct)
use-cases to consider when querying styles:

- For _inherited_ properties,
  the most relevant container is always
  _the direct parent_.
- For _non-inherited_ properties,
  the direct parent is often unreliable,
  and it's important to be explicit
  about the container to query.

This has been
[discussed in great detail](#default-container-types)
while determining the initial value
of `container-type`.

#### Default containers for inherited properties

When querying inherited properties,
the most relevant 'container' context
will generally be the direct parent
of the querying element.

For example,
if we want to change the `em` styles
based on the surrounding context.
For most `em` elements, we would add italics,
but _when the context is italic already_
we may want to apply a background instead:

```css
@container style(font-style: italic) {
  em {
    background-color: var(--highlight-bg);
    color: var(--highlight-text);
  }
}
```

In order for that _direct parent context_
to be available consistently,
we've defined that as the default:
_all elements are style containers_,
no matter what value is set in `container-type`.
Since there are no negative side-effects involved
with establishing style containers,
we think that's the best path for author usability.

If we need a way for authors to turn that off in some cases,
we can consider adding a `container-type: none` value
to remove it from the list of style containers.
However, we haven't seen any need for it
in the use-cases so far.
This
[default container-type](#default-container-types)
logic is discussed in more detail below.

#### Named containers for non-inherited properties

With dimensional queries,
we can know that the nearest `size`/`inline-size` container
_has a relevant size to query_,
and with inherited properties
we can assume the direct parent
_has a relevant property/value to query_.
But we can't reliably make any assumptions
about any container having a relevant value
for non-inherited properties

If we want to query the current padding
on a container,
or its background-color,
neither the direct parent
nor the nearest explicit container
would be reliable.
In this case,
authors should be much more explicit
about what containers
can provide relevant information.

That's already possible with the existing
`container-name` property,
which accepts any number of optional/reusable names
for a container.
This allows authors to establish
custom container patterns
across multiple components:

```css
.theme {
  container-name: theme;
}
.grid {
  container-name: layout;
}
.card {
  container-name: card layout theme;
}
```

By establishing container name conventions,
authors can ensure that a style query
is always targeting an appropriate container --
no matter their ancestor/descendant proximity,
or intervening (but irrelevant) containers.
To query the padding on a 'card' component,
always query a 'card' container.
To query the current color theme,
always query the nearest 'theme' container:

```css
@container card style(padding: var(--small)) {
  /* nearest 'card' ancestor has --small padding */
}

@container theme style(background-color: var(--bg-dark)) {
  /* nearest 'theme' ancestor has --bg-dark background-color */
}
```

## Key scenarios

### Setting parameters in web components

One of the primary use-cases
mentioned by Lea Verou
in her [request for higher level custom properties][higher-level],
is that web component authors
can expose parameters to
consumers of those components,
without needing to rely on custom attributes.

Given a `media-object` component
with the following HTML structure:

```html
<template>
  <article>
    <div part="img">
      <slot name="img">…</slot>
    </div>
    <div part="content">
      <slot name="title">…</slot>
      <slot name="content">…</slot>
    </div>
  </article>
</template>
```

We can use the `:host` element
as a container that accepts
various parameters:

```css
:host {
  container: media-host / inline-size;
  --media-location: before;
  --media-style: square;
  --theme: light;
}
```

Elements inside the component
can query the parameters
set on the `media-host` container:

```css
  article {
    display: grid;
    grid-template: var(--default-template);
  }

  @container media-host style(--media-location: after) {
    article {
      grid-template: var(--reverse-template);
    }
  }

  @container media-host style(--theme: fancy) {
    article {
      background:
        linear-gradient(to bottom right, #FFC0CBBB, #EEEC, #B0E0E6BB),
        conic-gradient(red, orange, yellow, green, blue, indigo, violet, red);
      color: var(--media-color--dark);
      border: medium solid mediumvioletred;
      border-top-left-radius: 70% 60%;
      border-top-right-radius: 30% 40%;
      border-bottom-right-radius: 30% 60%;
      border-bottom-left-radius: 70% 40%;
      padding: 3em;
    }
  }

  @container media-host style(--media-style: round) {
    [part='media'] {
      border-radius: 100%;
    }
  }
```

See the
[web component style query parameters demo](https://codepen.io/miriamsuzanne/pen/abKVaoo?editors=1000)
on CodePen.

### Contextual configuration without custom elements

While custom elements
helpfully provide a wrapping element
that can be used as a container --
the same general approach can be used
to establish contextual parameters
with normal light-DOM elements.
We can do that either with more generally-applied
(or even 'global') configuration.

If we rely on inheritance
for the contextual parameters,
there's no need to establish a container at all:

```css
main {
  --theme: blue;
  background: #223;
  color: snow;
}

@container style(--theme: blue) {
  .card {
    background: royalblue;
    border-color: navy;
    color: white;
  }

  a:any-link {
    color: powderblue;
  }

  button {
    border-color: navy;
    background-color: dodgerblue;
    color: white;
  }
}
```

Or we can add wrapper elements
by hand, when necessary.
Since this is required
for dimensional queries in relation
to grid and flexbox tracks,
the same wrappers can often be reused:

```css
.card-container {
  container: card / inline-size;
}

@container card style(--theme: blue) {
  .card { /* dark theme card styles */ }
}

@container card (inline-size > 30em) {
  .card { /* larger space card styles */ }
}
```

There are various codepen demos
that explore use-cases along these lines:

- [Style query test -- card themes](https://codepen.io/una/pen/abGXjJZ?editors=1100)
  by Una Kravets
- [Style query button themes](https://codepen.io/miriamsuzanne/pen/abGBNNx)
  by Miriam Suzanne
- [Light/dark/invert themes with style queries](https://codepen.io/miriamsuzanne/pen/xxzXdJQ)

### Parameters for generated content

Much like custom elements,
pseudo-elements
such as `::before` and `::after`
also come with a built-in container --
the element on which they are generated.
When using a pseudo-element to create
an 'arrow' on a tooltip,
we can use style queries to
set the style and position of the arrow:

```css
.bubble {
  --arrow-position: end end;
  container: bubble;
  border: medium solid green;
  position: relative;
}

.bubble::after {
  content: "";
  border: 1em solid transparent;
  position: absolute;
}

@container bubble style(--arrow-position: end end) {
  .bubble::after {
    border-block-start-color: inherit;
    inset-block-start: 100%;
    inset-inline-end: 1em;
  }
}

@container bubble style(--arrow-position: start end) {
  .bubble::after {
    border-block-start-color: inherit;
    inset-block-start: 100%;
    inset-inline-start: 1em;
  }
}
```

We can also combine queries
to avoid repeated properties:

```css
@container bubble style(--arrow-position: start start) or style(--arrow-position: end start) {
  .bubble::after {
    border-block-end-color: inherit;
    inset-block-end: 100%;
  }
}

@container bubble style(--arrow-position: start end) or style(--arrow-position: end end) {
  .bubble::after {
    border-block-start-color: inherit;
    inset-block-start: 100%;
  }
}

@container bubble style(--arrow-position: start start) or style(--arrow-position: start end) {
  .bubble::after {
    inset-inline-start: 1em;
  }
}

@container bubble style(--arrow-position: end start) or style(--arrow-position: end end) {
  .bubble::after {
    inset-inline-end: 1em;
  }
}
```

See the
[queries with pseudo-classes demo](https://codepen.io/miriamsuzanne/pen/vYjMjGd?editors=0100)
on CodePen.

### Simple value cycles

One of the common use-cases
seems to come with the best alternative solution,
at least in it's simplest form.
This is cycling one property-value
based on the value of the same property on the parent.

For example,
we can cycle the `font-style`
between `italic` and `normal` values
as we nest:

```css
em, i, q {
  font-style: italic;
}

@container style(font-style: italic) {
  em, i, q {
    font-style: normal;
  }
}
```

Now our `em`, `i`, and `q` tags
will be italic by default,
but will revert to normal when nested
inside an italic parent --
for example an `em` inside a `q`.

However, there's an
[existing proposal & spec](https://drafts.csswg.org/css-values-5/#funcdef-toggle)
for handling this use-case
with a function,
currently called `toggle()`:

```css
em, i, q {
  font-style: toggle(italic, normal);
}
```

### Complex value adjustments

In a case where the cycled styles
are limited to a single property,
the `toggle()` function is clearly a simpler solution.
But it has pretty strict limitations:

- One property cannot cycle
  based on the inherited value of another property.
- When multiple properties are involved,
  each has to be handled individually.

Instead of simply cycling between
italic and normal values,
we may want to give the nested version
a new background color,
or underline,
or other styles that make it stand out,
besides simply toggling the italics.

This is not possible with the functional approach,
but it becomes trivial with style queries:

```css
@container style(font-style: italic) {
  em, i, q {
    background: lightpink;
  }
}
```

Queries also allow us to use
multiple property conditions:

```css
@container style((font-style: italic) and (--color-mode: light)) {
  em, i, q {
    background: lightpink;
  }
}
```

Or apply the same query condition to multiple properties:

```css
@container style(font-style: italic) {
  em, i, q {
    /* clipped gradient text */
    background: var(--feature-gradient);
    background-clip: text;
    box-decoration-break: clone;
    color: transparent;
    text-shadow: none;
  }
}
```

None of those variations are possible
using the proposed `toggle()` function.

### Querying non-inherited properties

There are various use-cases
that involve querying non-inherited properties.

### Using `var()` in container queries

Light/dark themes are a consistently useful
example of contextual styling
that may depend on multiple inputs.
A few examples might include
querying the background-color of a container
to determine if the context has a light or dark theme:

```css
main, aside {
  container: theme;
}

main {
  background: var(--bg-dark);
}

aside {
  background: var(--bg-light);
}

@container theme style(background-color: var(--bg-dark)) {
  /* styles for our dark theme */
  a:any-link { color: powderblue; }
}

@container theme style(background-color: var(--bg-light)) {
  /* styles for our light theme */
  a:any-link { color: navy; }
}
```

Given the code above,
links in the `aside` and `main` elements
will respond contextually
to the background colors established in each.

Another example might involve
lists and other ideally-outdented content
to query available padding
on any typesetting container that they are in:

```css
body {
  container: typeset;
  padding: var(--gap-small);
}

/* This would ideally use a range query in the future */
@container typeset style(padding: var(--gap-large)) {
  ul {
    padding-inline-start: 0;
    color: green;
  }
}
```

There are several CodePen demos
showing this sort of behavior,
although they currently require an extra
custom property,
since the Chromium prototype
doesn't yet support queries on non-custom properties:

- [Light/dark/invert themes with style queries](https://codepen.io/miriamsuzanne/pen/xxzXdJQ)
- [List outdent with style queries](https://codepen.io/miriamsuzanne/pen/LYrOgwM?editors=1100)

### Replacing the 'variable space toggle' hack

The 'variable space toggle' hack
has gained some attention
as a workaround for simple true/false value conditions.
See, for example:

- https://lea.verou.me/2020/10/the-var-space-hack-to-toggle-multiple-values-with-one-custom-property/
- https://github.com/propjockey/css-sweeper#css-is-a-programming-language-thanks-to-the-space-toggle-trick
- https://css-tricks.com/the-css-custom-property-toggle-trick/

In many cases,
a container style query could be used
to provide similar functionality.
Some of these have already been demonstrated above.
However, the restriction against self-querying
can sometimes complicate those use-cases:

- https://codepen.io/miriamsuzanne/pen/wvXyMZx

If declaration-level conditional functions
are able to work around that limitation,
authors would have more options
for balancing the limitations of each approach.

## Detailed design discussion & alternatives

### Alternatives to an at-rule syntax

There have been several proposals
for using custom properties
as [higher-level controls][higher-level].

#### Inline conditional functions

[Inline conditional functions](https://github.com/w3c/csswg-drafts/issues/5009#issuecomment-626072319)
would provide a declaration-level control.
There are several proposals,
most notably Lea Verou's
[inline `if()`](https://drafts.csswg.org/css-conditional-values-1/#if)
proposal,
which seem useful to pursue
in parallel to this rule-block level feature.

Inline functions
have some limitations that can only be addressed
at this higher level:

- When controlling multiple properties
  based on a shared condition,
  the inline approach becomes extremely repetitive.
- When an at-rule or selector fails to match,
  the declarations inside are not applied
  and have no impact on the cascade --
  allowing implicit fallbacks to be defined
  elsewhere in the styles.
  However, at the point where an inline condition
  resolves to false,
  the cascade has already completed.
  Any fallbacks need to be defined inline as well.

We don't see these as competing approaches,
but features that would complement each other.

#### Global constants

Allowing selectors to access
arbitrary custom properties
creates a difficult condition loop --
where selectors and declarations
both depend on the other to resolve first.
One way around that would be to add
[global constants](https://github.com/w3c/csswg-drafts/issues/5624#issuecomment-766886708)
that can be defined at the root of a document
(including web components),
but not altered in selectors.
To quote from the proposal:

> These custom properties:
>
> - Can only take `<number>` and `<keyword>` values
>   (syntax may be extended in the future).
>   They cannot contain `var()` references.
> - Will likely be syntactically different
>   rather than just a different option in `@property`/`CSS.registerProperty()`.
>   This way the difference is obvious,
>   and also since they are resolved so early,
>   they are not subject to IACVT and can "fail early"
>   like every other property. Exact syntax TBD.
> - Their values can be referenced with `var()`
>   just like regular custom properties.
> - Custom properties can reference them with `var()`,
>   even though the opposite is not true.

This would require
a secondary property-definition syntax,
and clear distinction for authors between
'types' of custom properties
with different cascading features.
It also severely limits the author's ability
to _use the cascade_ in establishing
the variables to begin with.
Since the values are global within a context,
authors would need to rely on web components specifically,
in order to establish nested contexts
with different 'global' parameters.

#### Conditional pseudo-class

One of the more obvious syntax solutions
for a rule-block level condition
would be a functional pseudo-class.
However,
that introduces a dependency between
the selectors themselves
and the property-values
defined in the selector rule block.

Implementors are understandably
hesitant to add the multiple passes
required to resolve those conflicts --
but one workaround would be
_disallowing the pseudo-class on the subject compound_
(as [suggested by Anders Hartvoll Rudd](https://github.com/w3c/csswg-drafts/issues/5624#issuecomment-806823667)):

```css
/* Not valid */
.subject:const(--x:1) { /* ... */ }

/* Valid */
.container:const(--x:1) .subject { /* ... */ }
```

This is a viable solution,
but it stands out to me as having
the same limitations as a container query approach
(for the same reasons) --
while providing a bit less clarity and flexibility.

While there are other pseudo-classes
that are only meaningful on specific elements,
I don't know of existing cases
where a pseudo-class is _invalid_
in a specific selector position.
In this case,
the limitation is not obvious
in the syntax itself,
and could be difficult to teach or debug.
On the other hand,
an at-rule makes the distinction more clear:
a 'container' (target of the at-rule)
exists outside the 'subject' (target of the selector)
which will apply the conditional styles.

That has several advantages:

- Separate selectors can be used to
  define containers and subjects,
  rather than a single selector needing to target both
- Query targeting can rely on a cascaded `container-name`,
  rather than needing to re-assert
  the selectors for all possible containers
  in the conditional selector
- Multiple selectors can be targeted
  within a single condition

All of those issues are possible to work around
using a nested syntax --
but that relies on authors
to provide clarity,
rather than supplying it directly
in the syntax provided.

#### Building on container queries

Meanwhile,
the existing Container Query syntax
already provides
many of the requirements
for making style queries
on _all properties_
both functional and convenient,
without limiting them to global constants:

- The existing `@container` rule
  is established as a way
  of querying conditions on specific elements.
  Querying the value of a property
  is well within the scope of that functionality.
- The initial `normal` value
  for `container-type` simplifies the process for
  querying the nearest parent styles,
  especially useful for inherited properties.
- The existing `container-name` syntax
  allows explicit targeting of containers,
  especially useful for non-inherited properties.
- Container queries enforce a separation between
  the elements being styled
  and the 'container' being queried,
  which avoids potential style loops.
  This is the same limitation required
  by a pseudo-class,
  but the syntax does a better job 'enforcing'
  and clarifying the restriction.
- Authors are familiar with conditional at-rules,
  and can use existing methods for establishing
  fallback behavior.
  The addition of at-rule nesting
  will allow a somewhat more 'inline' approach
  when appropriate.
- This approach does not require
  any limitation on the type of property
  being queried,
  but would work with all existing
  (custom and pre-defined) properties.

The primary downside
is that elements are not able to query themselves.
This limitation is also unfortunate
in dimension-based queries --
and would likely limit pseudo-classes as well.
The workaround can require extra HTML
in some cases,
but that is less of an issue
in web components
where the `:host` can often act as a container
for the elements within:

```css
:host { container-name: host; }

@container host style(--orientation: landscape) {
  /* conditions using custom property parameters on the host element */
}
```

This syntax should also be extensible
in the future, to allow:

- Range queries, in addition to strict equality,
  e.g. `(margin >= 1em)`
- Arbitrary expressions,
  e.g. `(1vw > 1em)` or even `(margin > padding)`

Additionally, it would complement an inline `if()`,
so that both could rely on similar condition syntax,
and rules for comparison --
but the inline version would provide
a different set of tradeoffs:

- Single-property conditions (a shorthand for the simpler cases)
- _Invalid at computed value time_ behavior,
  rather than forced ancestor/descendant limitation
- Property-aware resolution of values for
  e.g. `%` units that have different meaning in different locations

### Default container types

There have been several relevant discussions
about the proper _initial value_
for `container-type`,
specifically in relation to
the needs of style queries:

- [#7202: Make container-type:auto the initial value?](https://github.com/w3c/csswg-drafts/issues/7202)
- [#7066: Revisit decision to make style the default container-type](https://github.com/w3c/csswg-drafts/issues/7066)
- [#7402: Rename 'none' to 'normal'](https://github.com/w3c/csswg-drafts/issues/7402)

In the end,
browsers have shipped an initial
`container-type` value
of `normal` --
which allows us to
expand the meaning of that
as we add new query types.

The current plan is for
all existing `container-types` --
`normal`, `size`, and `inline-size` --
to support style queries.
Without that feature,
it becomes much more difficult
to query inherited properties.
Authors would likely apply a `style` type universally,
and then need to be careful
not to override that value
when establishing size containers:

```css
* { container-type: style; }

/* Would accidentally remove the style type */
main { container-type: inline-size; }
```

If we find that there are reasons
to _override_ that
all-elements-are-style-containers
default behavior,
we can provide an explicit
`none` value.
At this point,
we haven't found any clear need for it.

## Stakeholder Feedback / Opposition

- Chromium : Positive —
  There is already a partial (custom properties only)
  prototype implementation in v107+ behind the
  'experimental web platform features' flag.
- Gecko : [No signals](https://github.com/mozilla/standards-positions/issues/686)
- Webkit : [No signals](https://github.com/WebKit/standards-positions/issues/57)

## References & acknowledgements

The CSS Containment spec is co-authored
by Tab Atkins and Florian Rivoal.
Elika Etimad was also involved
in specifying style queries.
Many of the goals and use-cases
are based on the work of Lea Verou
and others in the CSSWG-drafts Github issues,
along with Una Kravets and others linked above.

It has also been helpful
to have the Chromium prototype for experimentation,
with feedback from Nicole Sullivan,
and the browser engineers involved:
Rune Lillesveen, and Anders Hartvoll Ruud.
