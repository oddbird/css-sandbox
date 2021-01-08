# Cascade Layers Explainer

## Authors:

- Miriam Suzanne

With significant input from:

- Jen Simmons
- Elika Etemad
- Florian Rivoal
- Tab Atkins Jr.

## Participate

- [Cascade 5, Editor's Draft](https://drafts.csswg.org/css-cascade-5/)
- [Cascade 5 label](https://github.com/w3c/csswg-drafts/labels/css-cascade-5)
- [Cascade 5 + "layers"](https://github.com/w3c/csswg-drafts/issues?q=is%3Aopen+label%3Acss-cascade-5+layers)
- [Initial CSSWG Issue](https://github.com/w3c/csswg-drafts/issues/4470)
- [Initial Syntax Proposal](https://gist.github.com/mirisuzanne/4224caca74a0d4be33a2b565df34b9e7)

Some specific issues:

- [Do we need a keyword similar to `revert`, but for cascade layers?][5793]
- [Should unnamed cascade layers be allowed?][5792]
- [What is the appropriate syntax for appending to nested layers?][5791]
- [Cascade layers need an import syntax][5681]
- [Where do Cascade Layers fit in the cascade?][5003]
- [What is the migration path for Cascade Layers?][4985]
- [How do Cascade Layers interact with Shadow DOM][4984]
- [How do Cascade Layers interact with `!important`?][4971]
- [What are the proper "levels" for managing Cascade Layers?][4969]
- [Where do Cascade Layers fit in the cascade?][5003]

[5793]: https://github.com/w3c/csswg-drafts/issues/5793
[5792]: https://github.com/w3c/csswg-drafts/issues/5792
[5791]: https://github.com/w3c/csswg-drafts/issues/5791
[5681]: https://github.com/w3c/csswg-drafts/issues/5681
[5003]: https://github.com/w3c/csswg-drafts/issues/5003
[4985]: https://github.com/w3c/csswg-drafts/issues/4985
[4984]: https://github.com/w3c/csswg-drafts/issues/4984
[4971]: https://github.com/w3c/csswg-drafts/issues/4971
[4969]: https://github.com/w3c/csswg-drafts/issues/4969
[5003]: https://github.com/w3c/csswg-drafts/issues/5003

## Table of Contents

- [Authors:](#authors)
- [Participate](#participate)
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Goals [or Motivating Use Cases, or Scenarios]](#goals-or-motivating-use-cases-or-scenarios)
- [Non-goals](#non-goals)
- [Layering Styles](#layering-styles)
  - [The `@layer` rule](#the-layer-rule)
  - [Layer identifiers & unnamed layers](#layer-identifiers--unnamed-layers)
  - [Nesting layers](#nesting-layers)
- [Layers in the cascade](#layers-in-the-cascade)
  - [Cascade sort order](#cascade-sort-order)
  - [Layer sorting](#layer-sorting)
  - [The `@layers` rule](#the-layers-rule)
- [Key scenarios](#key-scenarios)
  - [Third-party libraries](#third-party-libraries)
  - [Targeted defaults](#targeted-defaults)
  - [Utility classes](#utility-classes)
  - [CSS architecture: the "inverted triangle"](#css-architecture-the-inverted-triangle)
- [Detailed design discussion](#detailed-design-discussion)
  - [What is the proper name for this feature?](#what-is-the-proper-name-for-this-feature)
  - [What is the migration path for authors?](#what-is-the-migration-path-for-authors)
  - [Use for refactoring](#use-for-refactoring)
- [Considered alternatives](#considered-alternatives)
  - [[Alternative 1]](#alternative-1)
- [Stakeholder Feedback / Opposition](#stakeholder-feedback--opposition)
- [References & acknowledgements](#references--acknowledgements)

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

The contents os a `<<url>>` import or `<<stylesheet>>` block
will be appended to the layer in question.
The `@layer` rule can also be used with only an identifier
to define a named layer without attaching any style rules.
This can be useful for establishing a layer order
in advance.

```css
/* @layer <<layer-ident>>; */
@layer reset;
@layer typography;
@layer design-system;
```

### Layer identifiers & unnamed layers

The optional `layer-ident` is a [CSS identifier][]
that either matches an existing layer name,
or defines a new _named layer_.
If no identifier is given,
an _unnamed layer_ is created.

[CSS identifier]: https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier

Layer identifiers provide a way
to apply multiple style blocks
to a single layer:

```css
@layer default url(headings.css);
@layer default url(links.css);

@layer default {
  audio[controls] {
    display: block;
  }
}
```

Layers without an identifier
cannot be added to or sorted explicitly
from any other location in the document styles.
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
internal layer identifiers are scoped to their parent layer.

In this example,
the nested "framework default" layer is distinct
from the top-level "default" layer:

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

The resulting layers can be represented as a tree:

1. default
2. framework
   1. _un-nested_
   2. default
   3. theme

or as a flat list with nested identifiers:

1. default
2. framework
3. framework default
4. framework theme

While it's not possible for nested layers
to reference a more global identifier,
it should be possible to reference nested layers
from an outer scope.
Our proposed syntax is to
combine nested identifiers with a full stop (. U+002E) character:

```css
@layer framework {
   @layer default {
     p { margin-block: 0.75em; }
   }

   @layer theme {
     p { color: #222; }
   }
}

@layer framework.theme {
   /* These styles will be added to the theme layer inside the framework layer */
   blockquote { color: rebeccapurple; }
}
```

See issue #5791:
[What is the appropriate syntax for appending to nested layers?][5791]

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
for both style attributes and custom layers:

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
the order of explicit layers
will be reversed inside the **important** origins.
This follows the same logic used for layering
normal and important origins,
so that the `!important` flag maintains
the same semantic purpose in both settings.
Un-layered styles rank highest in the normal origin,
and lowest in the `!important` origin.

For example, the following CSS:

```css
@layer reset url(remedy.css);
@layer base url(base.css);
@layer patterns url(system.css);
@layer components url(library.css);

/* un-layerd styles can appear anywhere */

@layer reset {
  /* authors can add to an existing layer */
  /* without changing where it appears in the layer order */
}

```

Results in the following layer orders:

1. Important **Author** Origin
   1. Important reset layer
   2. Important base layer
   3. Important patterns layer
   4. Important components layer
   5. Important *un-layered* styles
2. *Animations*
3. Normal **Author** Origin
   1. *un-layered* styles
   2. components layer
   3. patterns layer
   4. base layer
   5. reset layer

### The `@layers` rule

If authors do want to re-order layers,
they can do that by listing empty layer identifiers
before any other layers:

```css
@layer reset;
@layer base;
@layer bootstrap;
@layer components;
```

Still, it might be nice for authors
to have an explicit shorthand for achieving the same outcome.
We could add a `@layers` rule that has exactly the same functionality:

```css
@layers reset, base, bootstrap, components;
```

This would also help resolve
the fact that `@import` rules are required before all other CSS blocks.
By allowing `@layers` to appear before/between `@import` rules,
we can avoid  allowing `@layer` in that position.

## Key scenarios

### Third-party libraries

@@@

### Targeted defaults

@@@

### Utility classes

@@@

### CSS architecture: the "inverted triangle"

@@@

## Detailed design discussion

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

[See issue #4985][4985]

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
un-layered styles will always take precedence over layered styles.
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


### [Alternative 1]

@@@

## Stakeholder Feedback / Opposition

- Chromium : Positive --
  Google funded development of this explainer
- Gecko : [No signals](https://github.com/mozilla/standards-positions/issues/471)
- Webkit : No signals

## References & acknowledgements

Many thanks for valuable feedback and advice from:

- Anders Hartvoll Ruud
- Chris Harrelson
- Elika Etemad
- Florian Rivoal
- Jen Simmons
- Nicole Sullivan
- Rune Lillesveen
- Tab Atkins Jr.
- Theresa O’Connor
