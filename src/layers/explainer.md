---
title: CSS Cascade Layers Explainer
progress: ✅
tags:
  - explainer
created: 2021-01-08
changes:
  - time: 2021-09-09
    log: Link to cascade layer implementations
  - time: 2021-10-08T11:51:54-06:00
    log: By default, unlayered styles take priority
---

## Authors

Miriam Suzanne,
with significant input from:

- Jen Simmons
- Elika Etemad
- Florian Rivoal
- Tab Atkins Jr.

## Participate

Please leave any feedback on the CSSWG issues for this proposal,
or open new issues when appropriate:

- [Cascade 5, Editor's Draft](https://drafts.csswg.org/css-cascade-5/)
- [Cascade 5, Working Draft](https://www.w3.org/TR/css-cascade-5/)
- [Cascade-5 Github label](https://github.com/w3c/csswg-drafts/labels/css-cascade-5)
- [Request for TAG review](https://github.com/w3ctag/design-reviews/issues/597)

Browser issues:

- [Mozilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1699214)
- [Webkit](https://bugs.webkit.org/show_bug.cgi?id=220779)
- [Chromium](https://crbug.com/1095765)

Historic context:

- [Initial CSSWG Issue](https://github.com/w3c/csswg-drafts/issues/4470)
- [Initial Syntax Proposal](https://gist.github.com/mirisuzanne/4224caca74a0d4be33a2b565df34b9e7)

Typos or other document-specific issues
[can be reported in this repo](https://github.com/oddbird/css-sandbox/issues).

## Introduction

In the same way that Cascade Origins
help to balance styling concerns across stakeholders --
layering browser defaults, user preferences, and document styles --
it can be useful to have similar _layering of concerns_
within a single origin.
Author styles often start with browser normalization or resets,
then layer in default typography,
broad patterns (sometimes from design systems or frameworks),
and more specific component styles.

Currently that layering has to be achieved
with careful management of selector-specificity,
or over-use of `!important` flags --
both resulting in unwanted side-effects.
Cascade Layers would allow authors to define their own layering scheme
and avoid specificity or source-order conflicts across concerns.

## Goals [or Motivating Use Cases, or Scenarios]

Much of my work with design systems
has revolved around helping companies define layers of abstraction:
building tokens, then defaults, then patterns, components etc.
That's a common approach,
whether we call it OOCSS or BEM or ITCSS or something else.
In order to do that,
we often have to be very careful with matching specificity to layers --
so components override patterns, and so on.
But third-party tools can easily break that delicate balance,
requiring over-specific selectors or mis-use of the `!important` flag.

Cascading origins & `!important`
are designed to solve that same problem on a larger scale --
balancing UA defaults, user preferences, document authors.
It's a pretty clever solution,
with `!important` providing much-needed counter-balance.
But the primary tools available within a single origin
are specificity and source order.
The former is limited by the semantic requirements of selection,
and the latter can be hard to control in all situations.
There is a desire for "deterministic style ordering"
based on a more explicit syntax.

This proposal aims to address those issues
by providing customizable sub-origin "cascade layers" --
using similar logic to the layering of origins.

## Non-goals

There can be, in certain cases,
an overlap between layering and encapsulation context or "scope".
It's important that these features work well together,
but it would be dangerous to link them too tightly.
There are many use-cases for scope without layers
and vice versa.
Encapsulation and scope are generally tied
to specific DOM-tree fragments,
while layering should be available within and across fragments.

## Layering Styles

### The `@layer` rule

The `@layer` rule
describes an explicit cascade layer,
with the option to assign style rules
using either a nested stylesheet block
or a url import.

The import syntax is:

```css
/* @layer <<layer-ident>>? <<url>>; */
@layer reset url(remedy.css);
```

The block syntax is:

```css
/* @layer <<layer-ident>>? { <<stylesheet>> } */
@layer typography {
  h1, h2 {
    line-height: 1.2;
  }
}
```

The contents of a `<<url>>` import or `<<stylesheet>>` block
will be appended to the layer in question.

The `@layer` rule can also be used with only an identifier
to define a layer without attaching any style rules.
This can be useful for establishing a layer order
in advance.

```css
/* @layer <<layer-ident>>#; */
@layer reset;
@layer typography;
@layer design-system;
```

As a shorthand syntax,
multiple layer identifiers can be provided
in a single comma-separated rule.
The following example has exactly the same behavior:

```css
@layer reset, typography, design-system;
```

Both the url-import and ident-only syntax
would need to be allowed before `@import` rules.

### Layer names

The optional `layer-ident` is a [CSS identifier][]
that represents its _layer name_.
If the given layer-name matches that of an existing layer
defined in the same layer-scope, encapsulation context, and origin,
then its style rules are assigned to that existing layer.
If no identifier is given,
or no existing layer name matches the given identifier,
then a new layer is created.

[CSS identifier]: https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier

Layer names provide a way
to apply multiple style blocks
to that single layer:

```css
@layer default url(headings.css);
@layer default url(links.css);

@layer default {
  audio[controls] {
    display: block;
  }
}
```

Layers without a name
cannot be referenced from any other location.
While these layers behave exactly like named layers in every way,
they do not provide a "hook" for merging or re-ordering `@layer` rules:

```css
@layer url(reset.css);
@layer url(base.css);

@layer {
  /* the next layer */
}

@layer {
  /* and another */
}
```

In most use-cases this would only be syntax-sugar for brevity --
relying on well-organized source-order rather than any explicit names.
However, it could be used by teams
as a way to "force" an organizing convention
(all layer code must be defined in one place),
or by libraries wanting to merge & hide a set of internal "private" layers
that they don't want exposed to author manipulation:

```css
/* bootstrap-base.css */
/* unnamed wrapper layers around each sub-file */
@layer url(base-forms.css);
@layer url(base-links.css);
@layer url(base-headings.css);

/* bootstrap.css */
/* the intrnal names are hidden from access, subsumed in "base" */
@layer base url(bootstrap-base.css);

/* author.css */
/* author has access to bootstrap.base layer, but not into unnamed layers */
@layer bootstrap url(bootstrap.css);
```

Layer identifiers do not cross the shadow DOM boundary,
so the ordering of layers in the light DOM has no impact
on the order of identically-named layers in the shadow DOM.

### Nesting layers

When multiple `@layer` rules are nested,
the resulting layer names are a combination
of outer and inner identifiers,
separated by a period.

In this example,
the nested `framework.default` layer is distinct
from the top-level `default` layer:

```css
@layer default {
  p { max-width: 70ch; }
}

@layer framework {
  @layer default {
    p { margin-block: 0.75em; }
  }

  p { margin-bottom: 1em; }

  @layer theme {
    p { color: #222; }
  }
}
```

The resulting layers & layer-order are:

1. default
2. framework.default
4. framework.theme
5. framework _unlayered_
6. _unlayered_

As a shorthand,
nested layers can also be described
by combining identifiers in a single layer rule:

```css
@layer framework.theme {
   blockquote { color: rebeccapurple; }
}
```

When using layer names inside a nested context,
outer identifiers are prepended to any layer names.
That means it is not possible for nested layers
to reference layer names in a more global layer-scope:

```css
@layer default;
@layer framework {
   @layer default { /* framework.default */ }
   @layer theme.default { /* framework.theme.default */ }
}
```

See issue [#5791](https://github.com/w3c/csswg-drafts/issues/5791)

## Layers in the cascade

### Cascade sort order

- In order to address the use-cases described,
  layers need more cascade weight than the selectors they wrap.
- In order to avoid exponential complexity,
  layers should have less cascade weight than shadow-DOM encapsulation context.
- In order to remain backwards compatible,
  rules defined in the `style` attribute
  need to retain their status above any selector-applied styles.

In Cascade level 2
the style attribute was described through specificity,
and belonged to the normal author layer.
In level 3,
it is described through the scoping mechanism,
but that's not implemented anywhere.
In order to achieve all three of the goals above,
we propose adding explicit cascade sorting steps
for both style attributes and custom layers
(in order of cascade priority, highest to lowest):

1. Origins & Importance
2. Encapsulation Context (eg Shadow DOM)
3. **Style Attribute** -
   Declarations that do not belong to a style rule
   (such as the contents of a style attribute)
   take precedence over declarations that do belong to a style rule.
4. **Layers**
5. Specificity
6. Source Order

With Cascade Layers at a lower level than origins & importance,
layered declarations will continue to divide
into the existing origin structure:

1. *Transitions*
2. ❗️User Agent
3. ❗️User
4. ❗️**Author**
5. *Animations*
6. **Author**
7. User
8. User Agent

### Layer sorting

Author-defined layers are listed
in the document order where they are first introduced.
For the purpose of this step,
any declaration not assigned to an explicit layer
is added to an _implicit_ final layer.

When comparing declarations that belong to different layers,
then for **normal** rules
the declaration whose cascade layer is last wins,
and for **important** rules
the declaration whose cascade layer is first wins.

In other words,
non-layered styles normally override layered styles,
but order of layer priority
will be reversed inside the **important** origins.
This follows the same logic used for layering
normal and important origins,
so that the `!important` flag maintains
the same semantic purpose in both settings.
unlayered styles rank highest in the normal origin,
and lowest in the `!important` origin.

For example, the following CSS:

```css
@layer reset url(remedy.css);
@layer base url(base.css);
@layer patterns url(system.css);
@layer components url(library.css);

/* un-layerd styles can appear anywhere, */
/* and have the highest cascade priority */

@layer reset {
  /* authors can add to an existing layer */
  /* without changing where it appears in the layer order */
}
```

Results in the following layer orders
(in order of cascade priority, highest to lowest):

1. Important **Author** Origin
   1. Important reset layer
   2. Important base layer
   3. Important patterns layer
   4. Important components layer
   5. Important *unlayered* styles
2. *Animations*
3. Normal **Author** Origin
   1. *unlayered* styles
   2. components layer
   3. patterns layer
   4. base layer
   5. reset layer

Authors can use the ident-only `@layer` syntax
to establish explicit (or "deterministic") sorting of layers
before any styles are defined:

```css
/* establish the layer order */
@layer reset, base, patterns, components;

/* import into pre-ordered layers */
@layer base url(base.css);
@layer components url(library.css);
@layer patterns url(system.css);
@layer reset url(remedy.css);
```

## Reverting layered properties with `revert-layer`

Cascade Level 4 added the
[`revert` keyword](https://drafts.csswg.org/css-cascade/#default)
for rolling back values
to their definition in the previous origin.
We're proposing a similar syntax for rolling back
to the value defined in a previous layer.

```css
@layer default {
  h3 { color: rebeccapurple; }
}

@layer theme {
  h3 { color: maroon; }
  .no-theme { color: revert-layer; }
}
```

## Key scenarios

### CSS architecture: the "inverted triangle"

CSS is designed around the concept
of layering a cascade of styles --
starting with browser defaults, user preferences, and document design.
CSS provides a syntax for both broad-strokes
and minute details,
and selector specificity attempts to capture
the way those layers build on top of each other.

This has lead to common rules or "conventions" in CSS
that advocate keeping specificity low at all costs
(only using single-class selectors, as with [BEM])
or attempting to match specificity
with discreet layers
(as with [Inverted Triangle CSS][itcss])

[BEM]: http://getbem.com/
[itcss]: http://technotif.com/manage-large-css-projects-with-itcss/

Cascade layers would provide an explicit & built-in
way to author and name these layers,
without flattening selectors & specificity
within each layer:

```css
@layer settings url(settings.css);
@layer tools url(tools.css);
@layer generic url(generic.css);
@layer elements url(elements.css);
@layer objects url(objects.css);
@layer components url(components.css);
@layer trumps url(trumps.css);
```

### Targeted defaults, and general overrides

There are often particular issues
at the two extreme ends of
"inverted triangle" architecture --
targeted defaults, and general overrides.

A glance at default browser stylesheets
will show how much specificity can be required
to establish robust defaults.
In Firefox `resource://gre-resources/html.css`
we can find many examples like the following:

```css
/* only specified rules override 'border' settings
  (increased specificity to achieve this) */
table[rules]:not([rules=""])> tr > td,
table[rules]:not([rules=""])> * > tr > td,
table[rules]:not([rules=""])> tr > th,
table[rules]:not([rules=""])> * > tr > th,
table[rules]:not([rules=""])> td,
table[rules]:not([rules=""])> th
{
  border-width: thin;
  border-style: none;
}
```

While browsers can't rely on public classes & IDs,
they often do rely on attributes, pseudo-classes,
and complex nesting to create a reliable default.
The same would be useful for authors
to establish targeted defaults:

```css
@layer default {
  input[type=text]:invalid:not(:focus),
  input[type=url]:invalid:not(:focus),
  input[type=email]:invalid:not(:focus) {
    color: maroon;
  }
}

/* unlayered rules override the default layer */
.no-invalid {
  border-color: slategray;
}
```

CSS "Utilities" live at the other end
of the specificity/targeting mis-match.
The goal is to have a reusable selector
that accomplishes a single,
very specific, but generally-applicable task.
These are often intended for broad usage,
but require high cascade precedence.

Layers provide two interesting approaches --
either by treating utilities as `!important` defaults,
or by adding a `utility` layer
higher up in the cascade.

### CSS libraries

Shared CSS design systems, frameworks,
and component libraries are popular --
weather developed internally, or by a third-party.
These tools often provide several layers of abstraction,
from "design tokens" to layouts,
reusable patterns, and fully designed components.

This proposal would help both in
the development and usage of "third-party" CSS
from design systems, frameworks, or component libraries.
First, it allows library authors
to write more targeted/semantic selectors,
without forcing users to override each selector's specificity.

```css
@layer bootstrap url(bootstrap.css);
@layer override {
  /* override bootstrap without specificity conflicts */
}
```

Library authors can use `!important`
for its intended purpose,
to mark declarations that are required for functionality:

```css
@layer library {
  .tooltip {
    position: absolute !important;
  }
}
```

Users of the library would not need to use important
in order to override any normal library styles.
We hope that this would reduce the use of `!important`
by framework users.

Libraries would also be able to define
a public architecture for interacting with the
internal layers of the system:

```css
/* bootstrap.css */
@layer configuration url(configuration.css);
@layer content url(content.css);
@layer components url(components.css);
@layer utilities url(utilities.css);
```

Library users would then have the option
to slot custom layers _between_
layers of the library as desired:

```css
@layer bootstrap url(bootstrap.css);

@layer bootstrap.content {
  /* append styles to the bootstrap content layer */
}
```

Library authors may also decide that
some internal layering should be "private" --
and not available for users to interact with.
They can do that using anonymous layers:

```css
/* bootstrap.css */
@layer url(configuration.css);
@layer url(content.css);
@layer url(components.css);
@layer url(utilities.css);
```

## Detailed design discussion

See the
[existing issues marked for discussion](#participate)
for more.

### What is the proper name for this feature?

[See issue #4981][4981]

The initial post on the CSSWG issue tracker
referred to this feature as "custom origins" --
but in May 2020,
the Working Group resolved to call it
"cascade layers".

According to Jen Simmons
in the [meeting transcript][]:

> Talking with other folks the word layer is good.
> Invokes photoshop for some authors and way it's used in graphic design.
> Layer speaks for itself, it's a good word to have in there.

[meeting transcript]: https://github.com/w3c/csswg-drafts/issues/4981#issuecomment-628105429

While the photoshop association is useful,
it can also bring to mind something
more akin to `z-index` layering.

There are also some concerns
that this will cause author confusion
with the "[top layer][]" primitive used
for rendering alerts, dialogs, and `fullscreen` elements.
While the latter is not currently well-known,
there is discussion about
exposing that functionality to web authors in the future.

[top layer]: https://github.com/whatwg/html/issues/4633

### What is the migration path for authors?

Since this proposal defines Cascade Layers
directly above Specificity in the cascade,
but below inline style attributes,
it should be possible to polyfill the entire feature
using ID tags to boost specificity.
Most simply stated:

```css
#reset <selector> { /* reset layer */ }
#base#base <selector> { /* base layer */ }
#components#components#components <selector> { /* component layer */ }
```

In order to avoid requiring a match with ID attributes in the HTML,
that specificity can be generated using the `:is()` pseudo-class:

```css
:is(#r, <selector>) { /* reset layer */ }
:is(#b#b, <selector>) { /* base layer */ }
:is(#c#c#c, <selector>) { /* component layer */ }
```

The reality will require additional finesse
to avoid conflicts with existing ID selectors,
but those details can be left to individual polyfills.

### Use for refactoring

It would be nice for site refactors
to slot all the existing styles into a "legacy" layer,
and then have any/all new styles in a higher-priority layer.
As new styles are added,
they should always override the original legacy code.
But this case presents an issue:

In the normal author origin,
unlayered styles will always take precedence over layered styles.
Legacy code would need to be given an explicit layer.
That can be done in a manageable way, by using the layer import syntax.

However, if legacy styles are given the lowest normal layering,
any legacy `!important` rules would have even more power,
since important layer-order is reversed.

This would require changes to any legacy uses of `!important` --
either manually, or using a css transpiler --
so that normal rules have one layer,
and `!important` rules have a different layer.
Then both legacy layers can be individually placed
at the bottom of their respective stacks.

This is a purely mechanical transformation
which can be handled on the server side,
but if it needs to get syntax-error handling right,
it may not be trivial to write.

## Considered alternatives

### Top-level custom origins

The initial idea was to allow
"custom origins" be added into the cascade
in place of the existing "author" origins.
That would have allowed us to re-use
existing origin logic in browser engines.

There was concern about how that would
interact with Shadow DOM isolation.
To quote the original transcript:

> emilio: Shadow DOM introduces a stack of origins;
> introducing this naively makes it a matrix, which is harder.

Since none of the known use-cases
required power over shadow-DOM context --
only over specificity --
we were able to avoid that issue
by moving "layers" after "context"
in the cascade sorting order.

This also allows us to easily define layers
below the style attribute
(and any other element-attached styles)
in the cascade.

See issues
[#5003](https://github.com/w3c/csswg-drafts/issues/5003)
and
[#4984](https://github.com/w3c/csswg-drafts/issues/4984)

### Variations on important layering

We considered several variations
for how cascade importance would interact with layers.
There were several basic options
for sorting important layers:

- **Maintain** the same order used for normal styles
- **Reverse** the order of layers
- **Intertwine** the order of layers,
  so that normal styles from one layer
  can override important styles from the previous layer
- **Customize** the ordering of important layers
  by providing additional syntax

All of these approaches would usable
by authors to resolve the desired use-cases,
but they present different issues,
and different levels of complexity.

By making layers work the same as origins --
by reversing the order of important layers --
we are building on the original intent of the `!important` flag,
and helping teach proper usage.
Since authors are in control of the layering order,
it should still be possible to generate any overrides necessary.

See issue [#4971](https://github.com/w3c/csswg-drafts/issues/4971)

### Layering with selectors or flags

There was brief discussion of
providing this functionality
through new selectors
or `!` value flags.

Since the goal is to achieve
some author control of the cascade
without being tied to
the semantics of selection,
that approach didn't make much sense.

Similarly,
the use of a layering flag
(`!layer-2`?)
seemed more difficult to manage or define,
and too granular for most use-cases.

See issue [#4969](https://github.com/w3c/csswg-drafts/issues/4969)

## Alternative layer sorting

When the Working Group
first began discussing this feature,
there was a fear that it could
add significant confusion & complexity
around ordering layers.

We were mostly imagining something like z-index,
with each layer assigned an integer.
But that raised a lot of issues:

- Would the layer number be declared on the layer itself, or somewhere else?
- Would we need a way to map integers to names for readability?

That could have resulted in something like:

```css
@layers {
  --default: 0;
  --theme: 10;
}

@layer 15 { /* ... */ }
@layer (--theme) { /* ... */ }
```

In the Sass community there has been a long tradition
of generating z-index values from lists --
entirely replacing integers with names
for the author.
A function or mixin is used to return the index (from 1)
of a given name in the list:

```scss
$z-index: dropdown, sticky-header, notification, modal;

.modal-overlay {
  @include z-index(modal); // z-index: 4;
}
```

By avoiding the association
between layers and integers,
we were able to improve readability
in a similar way --
avoiding the temptation to
try random numbers,
or use extremes like `999999` as an override.

Layers have both a reliable default (source order),
and a syntax that allows pre-sorting
in cases where the final order is
unknown or un-controllable.

## Stakeholder Feedback / Opposition

- **Firefox**:
  - [Tracking issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1699215)
  - In Firefox Nightly,
    go to `about:config`
    and toggle the
    `layout.css.cascade-layers.enabled`
    feature flag.
- **Blink** (Chrome/Edge):
  - [Tracking issue](https://crbug.com/1095765)
  - In Chrome Canary,
    this currently requires a
    [run-time flag](https://www.chromium.org/developers/how-tos/run-chromium-with-flags)
    (`--enable-blink-features=CSSCascadeLayers`)
    while opening the browser from the command line.
- **Safari**:
  - [Tracking issue](https://bugs.webkit.org/show_bug.cgi?id=220779)

## Web Platform Tests

- [basic `@layer` support](http://wpt.live/css/css-cascade/layer-basic.html)
- [layering with `@import`](http://wpt.live/css/css-cascade/layer-import.html)
- [layering `@keyframes`](http://wpt.live/css/css-cascade/layer-keyframes-override.html)

## References & acknowledgements

Many thanks for valuable feedback and advice from:

- Anders Hartvoll Ruud
- Chris Harrelson
- Elika Etemad
- Florian Rivoal
- Jen Simmons
- Lea Verou
- Nicole Sullivan
- Peter Linss
- Rossen Atanassov
- Rune Lillesveen
- Tab Atkins Jr.
- Theresa O’Connor

## Changelog

### 2021-10-08

- CHANGE By default, unlayered styles take priority
  ([issue #6284](https://github.com/w3c/csswg-drafts/issues/6284#issuecomment-937262197))

### 2021.01.29

- CLARIFY the priority order of layers in relation to unlayered styles
- CHANGE to reflect current dot-syntax for nested layers
