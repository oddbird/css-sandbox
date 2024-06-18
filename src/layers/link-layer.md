---
title: Cascade Layering of HTML Linked Style Sheets
progress: 📝
tags:
  - explainer
created: 2024-06-18
---

## Authors

Miriam Suzanne

## Participate

There are discussion threads
on both the WHATWG and CSSWG
github repos:

- (WHATWG #7540)
  [Allow authors to apply new css features (like cascade layers) while linking stylesheets](https://github.com/whatwg/html/issues/7540)
- (CSSWG #5853)
  [Provide an attribute for assigning a `<link>` to a cascade layer](https://github.com/w3c/csswg-drafts/issues/5853)

## Introduction

Cascade layers
allow CSS authors to
create explicit cascade priority tiers,
and place style sheets into those tiers
using either a block at-rule (`@layer`)
or a condition on the `@import` rule
(`layer` or `layer(layer-name)`).
The details are defined in
[CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/).

One of the primary use-cases
for cascade layering
is to manage the priority
of third-party CSS
(libraries and design systems)
in relation to site-specific styles.
However,
there are many situations
where authors do not want to use `@import`
for performance reasons,
or cannot use `@import`
because of build tooling.
Providing this functionality on the HTML `<link>` tag
would bring it in better alignment with
the CSS import functionality.

## Goals

The motivating use-case
is quite specific:
a syntax for assigning linked style sheets
to a cascade layer.

This should:
- Allow assigning styles to either named or anonymous layers
- Invalidate links if a layer name is invalid,
  or cascade layers are unsupported

## Non-goals

This raises issues of compatibility.
For some period of time,
there will be browsers that do not support
the new layering syntax.
If those browsers apply the linked styles
without applying the appropriate layer rules,
the results will be unexpected and unreliable.

Ideally,
browsers without support for a layering syntax
should not load layered style sheets.
With the appropriate tools
for support-conditioned links,
authors could then choose to load
alternative style sheets.

However,
that would currently require
changes to the `media` or `type` attributes.
Looking farther out,
the WHATWG discussion seems to prefer
a separate/new attribute for support conditions,
since they are not technically treated
as media queries in CSS.
The details of that proposal
seem to be blocking progress
on the less controversial `layer` attribute
proposed below.
For that reason,
I've set aside support conditions
as a non-goal for this document.

## Proposed solution: the `layer` attribute

The `layer` attribute
applies to both `link` and `style` elements,
with the following behaviors:

- _missing_: The style sheet is not assigned to any cascade layer
- _empty string_: The style sheet is assigned to an anonymous layer
- `<layer-name>`: The style sheet is assigned to the named cascade layer.
  As with `@import`,
  the layer is added to the layer order
  even if the link fails to load the style sheet,
  but is subject to any other link conditions (such as `media`).
  This is just as if the layer was declared by an `@layer` rule
  wrapped in the appropriate conditional group rules.
- _none of the above_: The link is invalidated,
  and the style sheet should not load.

This is designed to match the behavior
of the `layer` keyword and `layer()` function
in the [CSS import syntax](https://www.w3.org/TR/css-cascade-5/#at-import).

Note that the
[empty attribute syntax](https://html.spec.whatwg.org/#attributes-2)
sets the value implicitly
to the _empty string_ --
so the `layer` attribute can be applied
as though it is a boolean attribute,
resulting in an anonymous layer.

## Key scenarios

Existing style sheet links
without the `layer` attribute
should continue to work
without any changes:

```html
<!-- no layering is applied -->
<link rel="stylesheet" href="example.css" />
<link rel="stylesheet" href="screen.css" media="screen" />
```

When working with resets,
third-party libraries, and design systems,
authors may want to apply layers on-import.
This is especially common since site authors
may not have access to edit the style sheet,
but still want to manage cascade priority
of the resulting styles:

```html
<!-- site.css can define layer order, and internal layering -->
<link rel="stylesheet" href="site.css" />

<!-- external styles can be assigned existing layers, or create new ones -->
<link rel="stylesheet" href="library/styles.css" layer="framework.library" />
<link rel="stylesheet" href="reset.css" layer="reset" />
<link rel="stylesheet" href="design/system.css" layer="framework.system" />
```

In some cases,
authors might want to wrap styles
in an anonymous layer
that can't be accessed later.
This can be used to enforce code order,
or simply move a reset
to the lowest cascade position:

```html
<!-- anonymously push a reset into a lower layer -->
<link rel="stylesheet" href="site.css" />
<link rel="stylesheet" href="reset.css" layer />

<!-- enforce layer rules are grouped in relevant files -->
<link rel="stylesheet" href="defaults.css" layer />
<link rel="stylesheet" href="patterns.css" layer />
<link rel="stylesheet" href="components.css" layer />
```

When given an invalid layer name
the style sheets will not apply.
That ensures a typo doesn't apply
un-layered style contents
which would have the highest cascade-priority.

## Detailed design discussion

While it would be nice to ship this
along with a broader import-condition syntax,
the details of that syntax
have been contentious.
However, the need for a new `layer` attribute,
and the general shape of that attribute
have not been controversial.

It might be worth noting
that other CSS features are likely to need
similar dedicated attributes.
For example,
the `@scope` block rule may warrant
a `scope()` import rule
and `scope` attribute.
However, this is the exception for CSS --
and only needed for larger architectural features.
It is not likely to become a common request.

## Stakeholder Feedback / Opposition

Authors have been asking when it will happen.
Implementors have been positive in the linked discussions.
Now that there is an explainer to reference directly,
I will ask for more explicit standards positions:

- Blink: TBD
- WebKit: TBD
- Gecko: TBD

## References & acknowledgements

Many thanks for valuable feedback and advice from:

- Discussions in the CSSWG & WHATWG
- Simon Pieters
- Florian Rivoal
- Adreu Botella
