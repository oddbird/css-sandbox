---
title: Scope Proposal & Explainer
tags:
  - explainer
created: 2020-12-15
changes:
  - time: 2021-08-24
    log: Link to syntax comparison
  - time: 2022-10-03
    log: Document scopes without selectors (thanks to [Dan Fabulich](https://twitter.com/dfabu))
---

## Authors

Miriam Suzanne

## Participate

Please leave any feedback on the CSSWG issues for this proposal:

- [Proposal for light-dom scoping/namespacing](https://github.com/w3c/csswg-drafts/issues/5809)
- [Request for TAG review](https://github.com/w3ctag/design-reviews/issues/593)
  (note that the explainer has been updated in response to feedback)
- [CSS Cascade & Inheritance Module level 6][css-cascade-6]
- [Issues labeled `css-cascade-6`](https://github.com/w3c/csswg-drafts/issues?q=is:open+is:issue+label:css-cascade-6)

Typos or other document-specific issues
[can be reported in this repo](https://github.com/oddbird/css-sandbox/issues).

[css-cascade-6]: https://drafts.csswg.org/css-cascade-6/#scoped-styles

## Introduction

There are many overlapping
and sometimes contradictory features
that can live under the concept of "scope" in CSS --
but they divide roughly into two approaches:

1. Total isolation of a component DOM subtree/fragment from the host page,
   so that no selectors get in or out
   unless explicitly requested.
2. Lighter-touch, style-driven namespacing,
   and prioritization of "proximity"
   when resolving the cascade.

That has lead to a wide range of proposals over the years,
including a [scope specification][initial-spec]
that was never implemented.
Focus moved to Shadow-DOM,
which is mainly concerned with approach #1 -- full isolation.
Meanwhile authors have attempted to handle approach #2
through convoluted naming conventions (like [BEM][])
and JS tooling
(such as [CSS Modules][], [Styled Components][], & [Vue Scoped Styles][]).

This document is proposing a native CSS approach
for what many authors are already doing
with those third-party tools & conventions.

[initial-spec]: https://www.w3.org/TR/css-scoping-1/
[BEM]: http://getbem.com/
[CSS Modules]: https://github.com/css-modules/css-modules
[Styled Components]: https://styled-components.com/
[Vue Scoped Styles]: https://vue-loader.vuejs.org/guide/scoped-css.html

## Goals

### The namespace problem

All CSS Selectors are global,
matching against the entire DOM.
As projects grow,
or adapt a more modular "component-composition" approach,
it can be hard to track what names have been used,
and avoid conflicts.

To solve this,
authors rely on
convoluted naming conventions (BEM)
and JS tooling (CSS Modules & Scoped Styles)
to "isolate" selector matching inside a single "component".

BEM helps authors by ensuring that only
component "blocks" need unique naming:

```css
.media { /* block */ }
.tabs { /* block */ }
```

Meanwhile,
any internal "elements" or "modifiers"
will be scoped to the block:

```css
.media--reverse { /* modifier */ }
.media__img { /* element */ }
.media__text { /* element */ }

.tabs--left { /* modifier */ }
.tabs__list { /* element */ }
.tabs__panel { /* element */ }
```

### The nearest-ancestor "proximity" problem

Ancestor selectors allow us to
filter the "scope" of nested selectors
to a sub-tree in the DOM:

```css
/* link colors for light and dark backgrounds */
.light-theme a { color: purple; }
.dark-theme a { color: plum; }
```

But problems show up quickly
when you start thinking of these as modular styles
that should nest in any arrangement.

```html
<div class="dark-theme">
  <a href="#">plum</a>

  <div class="light-theme">
    <a href="#">also plum???</a>
  </div>
</div>
```

Our selectors appropriately have the same specificity,
but they are not weighted by
"proximity" to the element being styled.
Instead we fallback to source order,
and `.dark-theme` will always take precedence.

There is no selector/specificity solution
that accurately reflects what we want here --
with the "nearest ancestor" taking precedence.

This was one of the
[original issues highlighted by OOCSS][oocss-proximity]
in 2009.

[oocss-proximity]: https://www.slideshare.net/stubbornella/object-oriented-css/62-CSS_WISH_LIST

### The lower-boundary, or "ownership" problem (aka "donut scope")

While "proximity" is loosely concerned with nesting styles,
the problem comes into more focus
with the concept of modular components --
which can be more complex.

To use BEM terminology,
Components are generally comprised of:

- An outer "block" or component wrapper
- Inner "elements" that belong to that block explicitly
- Occasional "donut holes" or "slots" where sub-components can be nested

In html templating languages,
and JS frameworks,
this can be represented by an "include"
or "single file component".

BEM attempts to convey this "ownership" in CSS:

```css
/* any title inside the component tree */
.component .title { /* too broad */ }

/* only a title that is a direct child of the component */
.component > .title { /* too limiting of DOM structures */ }

/* just the title of the component */
.component__title { /* just right? */ }
```

Nicole Sullivan coined the term
["donut" scope][donut] for this issue in 2011 --
because the scope can have a hole in the middle.
It would be useful for authors
to express this DOM-fragment
"ownership" more clearly in native HTML/CSS.

[donut]: http://www.stubbornella.org/content/2011/10/08/scope-donuts/

### Popular tooling for modular CSS

CSS Modules, Vue, Styled-JSX, and other tools
often use a similar pattern
(with slight variations to syntax) --
where "scoped" selectors only apply to
the locally described DOM fragment,
and not descendants.

In Vue single file components,
authors can write html templates
with "scoped" style blocks:

```html
<!-- component.vue -->
<template>
  <section class="component">
    <div class="element">...<div>
    <sub-component>...</sub-component>
  </section>
</template>

<style scoped>
.component { /* ... */ }
.element { /* ... */ }
.sub-component { /* ... */ }
</style>

<!-- sub-component.vue -->
<template>
  <section class="sub-component">
    <div class="element">...<div>
  </section>
</template>

<style scoped>
.sub-component { /* ... */ }
.element { /* ... */ }
</style>
```

While the language is similar to shadow-DOM in many ways,
the output is quite different --
and much less isolated.
The components remain part of the global scope,
and only the explicitly "scoped" styles are contained.
That's often achieved by adding automated unique attributes
to each element based on the component(s) it belongs to:

```html
<section class="component" scope="component">
  <div class="element" scope="component">...<div>

  <!-- nested component "shell" is in both scopes -->
  <section class="sub-component" scope="component sub-component">
    <div class="element" scope="sub-component">...<div>
  </section>
</section>
```

And matching attributes are added to each selector:

```css
/* component.vue styles after scoping */
.component[scope=component] { /* ... */ }
.element[scope=component] { /* ... */ }
.sub-component[scope=component] { /* ... */ }

/* sub-component.vue styles after scoping */
/* note that both style `.element` without any overlap or naming conflicts */
.sub-component[scope=sub-component] { /* ... */ }
.element[scope=sub-component] { /* ... */ }
```

- The donut is achieved by selectively adding attributes
- Proximity-weight is achieved only through limiting the donut of scope,
  so that outer values are less likely to "bleed" in
- Added attribute gives scoped styles _some minimal_
  extra specificity weight in the cascade
  compared to non-scoped elements.

## Non-goals

There is a more extreme isolation use-case.
It's mostly used for "widgets" that will appear unchanged
across multiple projects --
but sometimes also in component libraries
on larger projects.

Full isolation blocks off a fragment of the DOM,
so that it _only_ accepts styles that are
explicitly scoped.
General page styles do not apply.

We don't think this is the most common concern for authors,
but it has received the most attention.
Shadow DOM is entirely constructed around this behavior.

We have not attempted to address that form of scope in this proposal --
it feels like a significantly different approach
that already has work underway.

See Yu Han's proposals for
[building on shadow DOM](#should-we-be-building-on-shadow-dom)
below.

## Proposed Solution

In the long-standing
["Bring Back Scope"](https://github.com/w3c/csswg-drafts/issues/3547)
issue-thread,
Giuseppe Gurgone
[suggests a syntax](https://github.com/w3c/csswg-drafts/issues/3547#issuecomment-524206816) building on the original un-implemented `@scope` spec,
but adding a lower boundary:

```css
@scope (from: .carousel) and (to: .carousel-slide-content) {
  p { color: red }
}
```

That seems like a good start,
but we've worked to simplify and clarify
where possible.

### Defining scopes: the `@scope` rule

_The CSSWG has resolved to
put this work in
[CSS Cascading and Inheritance Level 6][css-cascade-6],
and rename [CSS Scoping](https://drafts.csswg.org/css-scoping/)
to be about Shadow-DOM specifically._

The current syntax proposal for `@scope` is:

```css
@scope [(<scope-start>)]? [to (<scope-end>)]? {
  <stylesheet>
}
```

This approach is designed to keep scoping confined to CSS
(no need for a new HTML attribute),
flexible
(scopes can overlap as needed),
and non-invasive
(global styles continue to work as expected).
Existing tools would still be able to
provide syntax sugar for single-file components --
automatically generating the `@scope` rule --
but move the primary functionality into CSS.

The `@scope` prelude syntax is made up of two parts,
a 'scope start' and 'scope end' clause.

#### Defining the scope root: `<scope-start>`

The `(<scope-start>)` clause,
defines the root of the scope
with a forgiving selector list:

```css
@scope (.media-block) {
  img { border-radius: 50%; }
}
```

That creates a 'scoped' tree fragment
that starts from any matched scope root element.
Both the matched element
and all its descendants
are _in the generated scope_.

The scope root selector is optional
when styles are nested in the DOM.
This allows a DOM-nested stylesheet
to implicitly scope styles,
using the direct parent 'owner' node of the `<style>` element
(or the containing tree
for constructable stylesheets with no owner node):


```html
<div>
  <style>
    @scope {
      p { color: red; }
    }
  </style>
  <p>this is red</p>
</div>
<p>not red</p>
```

That would be equivalent to:

```html
<div id="foo">
  <style>
    @scope (#foo) {
      p { color: red; }
    }
  </style>
  <p>this is red</p>
</div>
<p>not red</p>
```

The only difference is in the resulting
selector specificity,
which we describe in more detail below.

#### Defining scope boundaries: `<scope-end>`

The optional scope-end clause accept a list of selectors
that represent lower-boundary "slots" in the scope.
The `<scope-end>` clause is a forgiving selector list,
which is 'scoped' by the `<scope-start>` clause.
The targeted lower-boundary elements are excluded from the scope,
along with all their descendants:

```css
@scope (.media-block) to (.content) {
  img { border-radius: 50%; }
}
```

The above example would only match `img` elements
that are inside `.media-block` --
_but not if there are intervening `.content` elements
between the scope root and selector target_:

```html
<div class="media-block">
  <img src="..."><!-- this img is in the .media-block scope -->
  <div class="content"><!-- this ends the scope -->
    <img src="..."><!-- this img is NOT in scope -->
  </div>
</div>
```

Authors can write 'inclusive' lower boundaries
by appending `> *` to scope-end selectors.
In the example above,
if the `.content` element should be included in the scope,
while excluding its descendants,
the rule would become:

```css
@scope (.media-block) to (.content > *) {
  .content { /* This is now in scope */ }
}
```

### Nesting scopes

When `@scope` rules are nested,
the inner `<scope-start>` selectors
are 'scoped' by the outer scope definition.
This can be used to narrow down a scope fragment.
However, further nested selectors
still only have a single _scope_
defined by a single _scope-root_
and lower _scope boundaries_.

Note: This is not the same as the _intersection_ of scopes,
since the order is relevant.
Each nested scope is 'scoped' by the previous,
and can only match
if the new scope root
is 'in' the previous scope.

### Selecting a scope root: the `:scope` pseudo-class

(This section matches the proposed resolution
[of issue #8377](https://github.com/w3c/csswg-drafts/issues/8377),
rather than the current specification)

The existing
[Reference Element Pseudo-class][scope-class]
(`:scope`)
can be used in a scoped selector
to reference the scoping element.

When not explicitly used in a scoped selector,
the `:scope` pseudo is an implied ancestor:

```css
@scope (.media) {
  img { /* :scope img */ }
  .content { /* :scope .content */ }
}
```

However, authors can establish
an explicit or different relationship to the scope root
by including either `:scope` or `&` in the selector.
These _scope-containing_ selectors
do not get the implicit ancestor prepended:

```css
@scope (.media) {
  :scope img { /* :scope img */ }
  :scope .content { /* :scope .content */ }
}

@scope (.light-mode .media) {
  :scope { /* :scope */ }
  :root :scope > img { /* :root :scope > img */ }
  .sidebar:scope { /* .sidebar:scope */ }
}
```

Note that _scope-containing_ selectors
are able to reference the entire DOM tree.
Only the matched subject of the selector
is required to be _in scope_.

In many ways,
the `:scope` selector behaves
much like the `&` in CSS Nesting,
or the functional pseudo-class `:is(<scope-root>)`.
However, unlike the nesting `&`
or the `:is()` pseudo,
the `:scope` selector
refers specifically
to the root element of a scope -
so the following will not match
nested `.media` elements,
even if they are in-scope:

```css
@scope (.media) {
  :scope :scope { /* no match */ }
}
```

Instead, we could use any of the following:

```css
@scope (.media) {
  /* select nested .media inside the scope */
  .media { background: gray; }
  :scope .media { background: gray; }
  & & { background: gray; }
  :scope & { background: gray; }
}
```

### Scope in the cascade

The `@scope` rule has a double-impact
on the cascade of scoped selectors --
as part of specificity,
and then again in relation to proximity.

#### Scope Specificity

While 'scope' and 'specificity'
have some overlap --
and both impact on the priority
of a declaration --
we believe they should be handled separately
in the cascade.
Scope selectors are used for the purpose of scoping,
and should not have their specificity added
to the selectors that they scope.

A small amount of (class-level) specificity
can be added with explicit use of `:scope`,
and the full weight of the scoping selectors
can be added via the `&` selector:

```css
@scope (#media) {
  img { /* [0, 0, 1] */ }
  :scope img { /* [0, 1, 1] */ }
  & img { /* [1, 0, 1] */ }
}
```

This provides flexibility for authors
without increasing specificity by default.

Some [alternative approaches](#alternative-approaches-to-specificity)
are discussed below.

#### Scope Proximity

The scope syntax itself solves the issue of
naming-conflicts, with lower-boundaries and ownership.
But the issue of _proximity_ requires a change in the Cascade.
For that, we're introducing a new step
in the Cascade Sorting logic,
called _scope proximity_.

The _proximity_ of a selector
is a single number
representing the 'generational' distance
between a matched selector subject
and the selector's _scope root_ in the DOM tree.

(Note that nested scopes still result in a single root)

A direct parent/child relationship has a
proximity of `1`, while further nested subjects
will have higher proximity values.
If the subject of a selector
is itself the scope root,
then the proximity is `0`.
If no scope root is defined,
the proximity value is infinite.

In the cascade _scope proximity_ step of the cascade,
lower proximity selectors
have precedence
over higher proximity selectors:

```css
@scope (.light-theme) {
  a { color: purple; }
}

@scope (.dark-theme) {
  a { color: plum; }
}
```

```html
<div class="dark-theme">
  <a href="#">plum</a>

  <div class="light-theme">
    <a href="#">purple</a>
  </div>
</div>
```

While the more nested link
is matched by both selectors,
the selector with 'lower proximity scope'
(the `.light-theme` root)
is applied.

Given the same proximity of multiple scopes,
source order would continue to be the final cascade filter:

```css
@scope (.light-theme) {
  a { color: purple; }
}

@scope (.special-links) {
  a { color: maroon; }
}
```

```html
<div class="special-links light-theme">
  <a href="#">maroon</a>
</div>
```

There has been some debate about
[the priority of cascade proximity](https://github.com/w3c/csswg-drafts/issues/6790)
in relation to selector specificity.

- If specificity is given more weight in the cascade,
  then proximity is only considered
  for otherwise-equal-specificity selectors.
  We've been calling this _weak proximity_.
- If proximity has more weight in the cascade,
  then specificity is only compared within equal scopes.
  We've been calling this _strong proximity_.

Since both specificity and proximity are heuristics,
it's not clear which one is a 'better'
approximation of author intent.
The more common preference
has been for a _weak proximity_ --
since that leaves authors with more tools
for resolving conflicts in either direction,
through layering, or specificity adjustments.
This is also the behavior applied
by the existing browser prototype.

That means, currently,
**specificity will override scope proximity**.
Given the following CSS,
a paragraph matched by both rules
would be `red`,
thanks to the added specificity:

```css
@scope aside {
 p { color: green; }
}

aside#sidebar p { color: red; }
```

This is a major departure from both
the [original scope specification][initial-spec]
and Shadow-DOM [encapsulation context][],
which override specificity.

We [discuss this in more detail below](#where-does-scope-fit-in-the-cascade).

## Key scenarios

### Avoid naming conflicts without custom conventions

Authors currently rely on intricate naming conventions
to avoid duplicate naming within components:

```css
.article__title {
  font-size: 2em;
}
.article__meta {
  font-size: 2em;
}

.form__title {
  font-weight: bold;
}
.form__meta {
  font-weight: bold;
}
```

Sometimes authors will automate that process,
and group names visually,
using nested syntax in a pre-processor like Sass:

```scss
.article {
  &__title { font-size: 2em; }
  &__meta { font-style: italic; }
}

.form {
  &__title { font-weight: bold; }
  &__meta { text-align: center; }
}
```

This syntax would provide a uniform solution
that is native to CSS.
Authors can reduce naming conflicts
across CSS "components"/"objects"
by scoping internal selectors
so they only match within a particular block:

```css
@scope (article) {
  .title { font-size: 2em; }
  .meta { font-style: italic; }
}

@scope (form) {
  .title { font-weight: bold; }
  .meta { text-align: center; }
}
```

### Express ownership boundaries in nested components

By adding lower boundaries or "slots" to the scope,
ownership becomes more clear
when the scopes are nested.

Using the example above,
we can allow comment forms to be nested inside articles
while continuing to maintain the
distinction between article-elements
and form-elements:

```css
@scope (article) to (.comments) {
  .title { font-size: 2em; }
  .meta { font-style: italic; }
}

@scope (.comments) {
  .title { font-weight: bold; }
  .meta { text-align: center; }
}
```

### Recursive nesting with ownership

This can also be useful
when applying modifiers to components
that might nest indefinitely --
such as the popular "media-object"
containing a fixed image and responsive content
that flows around it.
Modifiers can be added to an outer component
without impacting nested components of the same type.

For example,
nested "media objects"
of different types:

```html
<div class="media reverse">
  <img src="...">
  <div class="content">
    <div class="media">
      <img src="...">
      <div class="content">
      </div>
    </div>
  </div>
</div>
```

Rather than adding the `.reverse` modifier
to every element in the outer media block,
we can scope the effects of the modifier.
This could be done in a variety of ways,
but may be a good use-case for nesting scopes:

```css
@scope (.media) to (.content) {
  /* only the inner image */
  @scope (:scope:not(.reverse)) {
    img { margin-right: 1em; }
  }

  /* only the outer image */
  @scope (:scope.reverse) {
    img { margin-left: 1em; }
  }
}
```

### Recognizing proximity of nested components without lower-bounds

As [demonstrated above](#scope-proximity-in-the-cascade),
authors could establish
scope precedence
even when lower bounds are not required.
For example,
light and dark themes
that can be nested
in any arrangement:

```css
@scope (.light-theme) {
  a { color: purple; }
}

@scope (.dark-theme) {
  a { color: plum; }
}
```

```html
<div class="dark-theme">
  <a href="#">plum</a>

  <div class="light-theme">
    <a href="#">purple</a>

    <div class="dark-theme">
      <a href="#">plum again</a>
    </div>
  </div>
</div>
```

### JS tools & "single file components"

Existing tools could move to automating
this syntax over time,
rather than using custom attributes,
since the result is very similar.
Without any changes visible to the user,
output that currently looks like:

```css
/* component.vue styles after scoping */
.component[scope=component] { /* ... */ }
.element[scope=component] { /* ... */ }

/* sub-component.vue styles after scoping */
/* note that both style `.element` without any overlap or naming conflicts */
.sub-component[scope=sub-component] { /* ... */ }
.element[scope=sub-component] { /* ... */ }
```

Could be converted to:

```css
/* component.vue styles after scoping */
@scope (.component) to (.sub-component) {
  :scope { /* ... */ }
  .element { /* ... */ }
}

/* sub-component.vue styles after scoping */
@scope (.sub-component) {
  :scope { /* ... */ }
  .element { /* ... */ }
}
```

## Detailed design discussion & alternatives

### Should we be building on Shadow DOM?

This is often the first question asked
of any scope-related proposal,
for good reason.
Shadow-DOM was designed for the express purpose
of encapsulating styles & behavior.

But "scope" can describe
a number of sometimes-contradictory use-cases,
which can't all be solved using the same primitives.
Shadow-DOM starts from a few assumptions
that make sense in very specific use-cases,
but do not describe the majority of web design:

- Scoped styles match 1:1 with scoped elements in the DOM
- Scopes nest, but they do not overlap
- By default, no selectors should cross the encapsulation boundary

Yu Han has
an [interesting proposal][han]
in two parts,
designed to improve shadow-DOM,
by providing some more flexibility:

1. Allow shadow-DOM elements to opt-in to global styles
2. Allow light-DOM elements to opt-in to style isolation

[han]: https://docs.google.com/document/d/1hhjmuQE6BTTnAyKP3spDr8sU6lpXArh8LDfihZh78hw/edit?usp=sharinghttps://docs.google.com/document/d/1hhjmuQE6BTTnAyKP3spDr8sU6lpXArh8LDfihZh78hw/edit?usp=sharing

Those proposals
(along with declarative shadow-DOM)
would be very helpful for making strong isolation
more flexible for authors.
But even with that added flexibility,
many of the assumptions & limitations remain.

Shadow-DOM is not designed
for the common "design system" approach,
where patterns overlap in more fluid ways,
and global styles are expected to "flow through"
and tie all the pieces together.

### Are scope attributes useful in html?

Many scope proposals include
a scope attribute in HTML.
That's required for the full-isolation use-case --
where elements need to opt-in or out of global page styles up-front.
But following that path would make scope
much more similar to shadow-DOM
in it's limitations:

- Either we need a way to define lower-boundaries in the markup as well,
  or we make scopes exclusive/non-overlapping
- Authors have to manage scope in both HTML and CSS

Some authors might appreciate the
"automatic" nature of that approach,
but they could achieve the same goals
with a naming convention or tooling:

```css
p { color: blue; }

@scope ([data-scope=main]) to ([data-scope]) {
  p { color: green; }
}
@scope ([data-scope=note]) to ([data-scope]) {
  p { color: gray; }
}
```

```html
<p>This text is blue</p>
<section data-scope="main">
  <p>This text is green</p>
  <div data-scope="note">
    <p>This text is gray</p>
  </div>
</section>
<div data-scope="note">
  <p>This text is gray</p>
</div>
```

### Do we need special handling around the shadow-DOM?

This proposal would have no impact
on existing shadow DOM behavior.
Scoped styles can be used in both light and shadow DOM.
Both scopes & scoped styles respect the shadow boundary,
like any other CSS rules.

There are still some
[questions raised by Rune Lillesveen](https://github.com/w3ctag/design-reviews/issues/593#issuecomment-768992509)
about what selectors
would be allowed inside
a shadow-DOM encapsulated scope rule:

> For selectors in @scope rules in shadow trees,
> we should figure out which restrictions apply wrt
> matching elements outside the shadow tree.
> `@scope` rules in shadow trees should not be able
> to target elements outside the shadow tree,
> but what about `:host`/`:host-context`?
>
> - `@scope (:host(.a))` : should not match
> - `@scope (:host(.a) .b)` : should match?
> - `@scope (::slotted(.a))` : should not match
> - `@scope (::part(my-part))` : should not match

### A JS API for fetching "donut scope" elements?

Given a tree fragment,
JS is able to match elements _within_ a donut scope:

```js
const matches = root.querySelectorAll(
  "*:not(:scope boundary, :scope boundary *)"
);
```

With CSS nesting,
it would also be possible
to use the `@scope` rule directly:

```js
document.querySelector("@scope (root) to (boundary) { * }");
```

But those solutions
do not provide any way to
select and capture the "donuts" themselves,
only select elements inside the donut.

Rather than adding a new selector format,
the CSSWG has defined
a second "exclusions" parameter
on methods like `querySelector()` and `querySelectorAll()`:

```js
document.querySelector("root", "boundary");
```

This has been agreed on by the CSSWG.

### How does scope interact with the nesting module?

Conceptually,
there is a fair amount of overlap
between CSS 'scoping'
and some use-cases for
[CSS Nesting][nesting].

[nesting]: https://drafts.csswg.org/css-nesting/

Scope can be used for a subset
of nesting use-cases,
where the nested-selector subject is a descendant
of the parent-selector subject.
In those cases,
scope provides additional benefits,
such as lower boundaries and proximity weighting.

Ideally,
we should allow authors to combine these two approaches,
or move smoothly between them.

In the nesting syntax, for example,
we would allow
the `@scope` rule to be nested inside
an existing selector block.
The scope rule
could establish a scope-root based on the parent selector,
using `&`.
These examples
would have the same meaning:

```css
/* explicit scope with root */
@scope (.media) to (.content) {
  img { object-fit: cover; }
}

.media {
  /* nested scope with explicit nesting root */
  @scope (&) to (.content) {
    img { object-fit: cover; }
  }
}
```

Similarly,
we can allow `&` in a scoping context
to refer to the scope root selector:

```css
/* explicit scope with root */
@scope (.media) to (.content) {
  & > img { object-fit: cover; }
}
```

This is much like using `:scope`,
but they have slightly different matching behavior.
The `&` selector
represents an entire selector list,
and could match nested `.media` elements --
While the `:scope` selector
represents a specific scoping root element in the DOM.

### What happens when the root element matches the lower-boundary?

It's possible that authors
might use the same selector for both
the root and lower-boundary of a scope
(or use different selectors that match the same element):

```css
a { color: rebeccapurple; }

@scope (.dark-theme) to ([class*='-theme']) {
  a { color: plum; }
}
```

Since the lower boundary selector is scoped
by the root selector,
it is implicitly a descendant
unless otherwise specified:

```html
<!-- dark-theme scope root -->
<div class="dark-theme">
  <a href="#">plum</a>

  <!-- dark-theme scope boundary -->
  <div class="light-theme">
    <a href="#">rebeccapurple</a>
  </div>

  <!-- dark-theme scope boundary & nested scope root -->
  <div class="dark-theme">
    <a href="#">plum</a>
  </div>
</div>
```

There aren't any obvious use-case
for single-element scopes,
but they can be achieved with the
explicit `:scope` selector:

```css
@scope (.self) to (:scope *) { /* ... */ }
```

### Where does scope fit in the cascade?

For a more detailed exploration of this,
see: [scope in the cascade](/scope/cascade/).

#### The 2014 scope proposal

The [original scope specification][initial-spec]
put scope above specificity in the cascade,
and the layering was importance-relative:

> For normal declarations the inner scope's declarations override,
> but for ''!important'' rules outer scope's override.

That would mean first
that scope takes precedence over specificity.
By default, the more locally-scoped style always wins:

In this example
from the outdated specification,
a paragraph matched by both selectors
would be green:

```css
@scope aside {
 p { color: green; }
}

aside#sidebar p { color: red; }
```

But the roles would reverse
when `!important` is used,
and the following example paragraph would be red:

```css
@scope aside {
 p { color: green !important; }
}

aside#sidebar p { color: red !important; }
```

#### Shadow-DOM encapsulation context

Shadow-DOM [encapsulation context][]
also comes above/before specificity in the cascade,
with an importance-reversal.
To quote the spec:

> When comparing two declarations
> that are sourced from different encapsulation contexts,
> then for normal rules the declaration from the outer context wins,
> and for important rules the declaration from the inner context wins.

This is the opposite of the original scope proposal,
and means:

> …normal declarations belonging to an encapsulation context
> can set defaults that are easily overridden by the outer context,
> while important declarations belonging to an encapsulation context
> can enforce requirements that cannot be overridden by the outer context.

[encapsulation context]: https://drafts.csswg.org/css-cascade-5/#cascade-context

#### The case for less isolation, and weak proximity

We have intentionally gone in the other direction,
making scope proximity _less powerful_ than specificity
in the cascade.
There is clearly interest in both strong & weak approaches to scope,
but we believe encapsulation context
can be expanded and improved on
for the high-isolation use-cases.
Meanwhile low-isolation scope has not been addressed.

By placing _scope proximity_
below/after specificity in the cascade,
We are explicitly & intentionally allowing
more global styles to flow through,
interact with,
and even override scoped styles:

```css
@​scope (aside) {
  p { color: green; }
}

aside#sidebar p { color: red; }
```

```html
<aside id="sidebar">
	<p>This is red</p>
</aside>
```

The primary use-case that we're trying to address
is one in which component-styles are "locked-in"
to avoid cross-contamination,
but global styles are used to "tie it all together"
with consistent patterns like typography and branding.
The desired behavior is to prevent scoped styles from leaking out,
without getting in the way of global patterns
that should flow through easily.

If we give scope proximity more weight than specificity,
authors are left with very few tools to manage that relationship.
By putting proximity _below_ specificity,
authors can manage it in several ways:

- Adjust specificity to reflect desired priority,
  with equal specificity to trigger _proximity_ results
- Add lower boundaries to avoid overlap of styles

This _in-but-not-out_ approach
also matches the existing JS tools & CSS naming conventions
that authors already use.
Those tools add lower-boundaries,
and a single attribute-selector of increased specificity --
very easy to override from the global scope.
We think this low-weight approach to scope is also backed up by…

- much of the [long-running conversation on CSSWG][bring back scope]
- a [quick informal survey on Twitter][survey]
- Nicole Sullivan's [explainer from a couple years ago][nicole-scope]
- The majority of [responses to the open issue](https://github.com/w3c/csswg-drafts/issues/6790)

Anecdotally,
many CSS beginners surprised
that the fallback for specificity
is source-order rather than proximity.
This proposal would allow authors to opt-into
that expected proximity-over-source-order fallback behavior.

Meanwhile,
encapsulation could be expanded
for [use in the light DOM][isolation],
and proposal would continue to be distinct --
covering a significantly different set of use-cases.

[survey]: https://twitter.com/TerribleMia/status/1351247559738621952
[isolation]: https://docs.google.com/document/d/1hhjmuQE6BTTnAyKP3spDr8sU6lpXArh8LDfihZh78hw/edit?usp=sharinghttps://docs.google.com/document/d/1hhjmuQE6BTTnAyKP3spDr8sU6lpXArh8LDfihZh78hw/edit?usp=sharing
[nicole-scope]: https://docs.google.com/presentation/d/1Ki-IUCEWU-mNlS-019QVV9I9JsytvafQJHTxpBNfYvI/edit?usp=sharing

#### Alternative approaches to specificity

Existing tools
achieve donut scope
by appending a single attribute
to each selector.
If we wanted to match that behavior,
we could give `:scope`
the normal pseudo-class weight --
even when implicitly added.
Given the following code:

```css
@scope (#media) to (.content) {
  img { /* implied :scope ancestor */ }
  :scope img { /* explicit :scope ancestor */ }
}
```

This approach would result in
a specificity of `[0, 1, 1]`
for each selector.

[Sara Soueidan has also proposed][scope-id]
giving `@scope` the selector-weight of an `#ID`.
That would acknowledge the targeting weight of scopes,
without making them override all specificity.
While it's an interesting idea,
it seems less-intuitive & less flexible
than the alternatives.

[scope-id]: https://twitter.com/sarasoueidan/status/1351248295969103873?s=21

The original proposal
was designed to match CSS Nesting
when it comes to specificity.
We can do that by
applying the scope-root specificity
to the overall specificity of each selector --
as though de-sugared to `:is(<scope-start>)`.
The following examples
would all have a specificity of `[1, 0, 1]`:

```css
@scope (#footer, footer) {
  a { /* :is(#footer, footer) a */ }
  :scope a { /* :is(#footer, footer) a */ }
}
```

This matches the behavior of `&`
in nested selectors,
as well as ensuring the same specificity
with or without the explicit use of `:scope`.

However,
the group has resolved in favor
of scope not having any impact on specificity.
While specificity is often
the way authors think about managing priority,
scope is a different concern
(like layers or shadow context)
and there is no reason to muddy the water.

## Spec History & Context

Besides the tooling that has developed,
there are several current & former specs
that are relevant here...

### CSS Scoping

- [First Public Working Draft][initial-spec]
- [Editors Draft](https://drafts.csswg.org/css-scoping/)

There is often pushback to the question of scope,
since the initial specification was never implemented,
and Shadow DOM was seen as a path forward.
While the current editors draft
is primarily concerned with Custom Elements & Shadow DOM,
this spec initially contained a full set of scoping features
that have since been removed:

A `<style scoped>` attribute,
which would apply styles
scoped to a particular DOM sub-tree.
This had a few limitations:

- Authors need to repeat styles in the DOM for every instance of the scope
- Those style need to live in distinct stylesheets

The use-cases that necessitate that approach
are now being handled by shadow encapsulation,
which frees us up to consider different use-cases now.

The spec also included `@scope` blocks in CSS,
which would help alleviate both issues.
Scoping has two primary effects:

1. The selector of the scoped style rule
   is restricted to match only elements within a subtree of the DOM
2. The cascade prioritizes scoped rules over un-scoped ones,
   regardless of specificity
3. Important declarations would flip the cascade order of scopes

Point 1 is limited by the need for lower scope boundaries,
or "donut scope".

Points 2 & 3 give scope _significant_ power in the cascade --
power that we now plan to provide through Cascade Layers.
While there are instances where the semantics of
layering, scoping, and containment
might reasonably overlap --
the combinations remain more flexible
when each one has it's own syntax.

In this proposal,
scope is only given a _minimal_ role in the cascade,
and mostly acts as a protection from naming conflicts.

### [CSS Selectors - Level 4](https://www.w3.org/TR/selectors-4/)

- [Scoped Selectors](https://www.w3.org/TR/selectors-4/#scoping),
  which only refer to a subtree or fragment of the document
- [Reference Element][scope-class]
  (`:scope`) pseudo-class ":scope elements" or the root of any scope
  (currently used in JS APIs only)

[scope-class]: https://www.w3.org/TR/selectors-4/#the-scope-pseudo

### [CSS Cascade - Level 4](https://www.w3.org/TR/css-cascade-4/)

- [Removes](https://www.w3.org/TR/css-cascade-4/#change-2018-drop-scoped)
  “scoping” from the cascade sort criteria,
  because it has not been implemented.
- Adds [encapsulation context](https://www.w3.org/TR/css-cascade-4/#cascade-context)
  to the cascade, for handling Shadow DOM
  - Outer context wins for *normal* layer conflicts
  - Inner context wins for `!important` layer conflicts

## Stakeholder Feedback / Opposition

- Chromium : Positive --
  Google was involved in developing this proposal
- Gecko : No signals
- Webkit : No signals

## References & acknowledgements

Related/previous issues and discussions:

- [Bring Back Scope][]:
  - [@scope with lower-bounds](https://github.com/w3c/csswg-drafts/issues/3547#issuecomment-524206816)
  - [@scope with name & attribute](https://github.com/w3c/csswg-drafts/issues/3547#issuecomment-693022720)
- [Selector Boundaries](https://github.com/w3c/csswg-drafts/issues/5057)
- [CSS Namespaces](https://github.com/w3c/csswg-drafts/issues/270)
  ([priorities](https://github.com/w3c/csswg-drafts/issues/270#issuecomment-231586786))

[Bring Back Scope]: https://github.com/w3c/csswg-drafts/issues/3547

In addition to the open issue threads mentioned above,
thanks for valuable feedback and advice from:

- Anders Hartvoll Ruud
- Giuseppe Gurgone
- Ian Kilpatrick
- Keith Grant
- Kenneth Rohde Christiansen
- Lea Verou
- Mason Freed
- Nicole Sullivan
- Rune Lillesveen
- Sara Soueidan
- Tab Atkins
- Theresa O'Connor
- Una Kravets
- Yu Han

## Change log

### 2023.04.13

- Update the sections on specificity.

### 2023.03.21

- Updated to match resolutions from the previous year,
  and the updated Working Draft

### 2021.08.24

- LINK to [syntax comparison](/scope/syntax/)

### 2021.02.03

- CLARIFY approaches to specificity
- CLARIFY behavior when scope boundaries match scope root
  (e.g. `@scope (a) to (a)`)
- CLARIFY differences between scope and shadow-DOM
- CLARIFY shadow-DOM issues to be addressed
- CLARIFY redundant discussion sections
- CLARIFY donut scope in JS
- Discussion of tree-abiding pseudo elements as scope roots

### 2021.01.29

- CLARIFY reasons for using `:scope` rather than `&`

### 2021.01.28

- NEW: Add proposal for `:in()` donut-scope selector
- CHANGE: Update specificity definition to reflect pseudo-class alternative
- CHANGE: Remove `&` syntax, to avoid conflicts with nesting
- Detailed discussion of selector syntax
- Detailed discussion of JS API for fetching a donut scope
- Detailed discussion of scope-nesting

### 2021.01.27

- CHANGE: Follow the [nesting module][nesting] rules
  for combining specificity of the scope selector
  with specificity of nested/scoped selectors.
- CHANGE: Allow [nesting module][nesting] syntax
  to be used [in scoped selectors](#the--nesting-selector)
- CLARIFY: The scope-root is prepended (as an ancestor)
  to all scoped selectors
  unless explicitly placed by use of `&` or `:scope`
- CLARIFY: The placement of
  [scope in the cascade](#where-does-scope-fit-in-the-cascade),
  and reasons for allowing specificity
  to flow-through scopes in a single direction

### 2021.01.18

- Update acknowledgements
- CHANGE: Require `:scope` pseudo-class in scoped selectors that reference
  [context outside of the scope](#can-scoped-selectors-reference-external-context)
- CLARIFY: Shadow DOM behavior (scope respects shadow boundaries)
- CLARIFY: question about selector-lists in scope-root syntax
- CLARIFY: consistently use parenthesis around scope-root selectors
- CLARIFY: additional discussion of scope in the cascade
- CLARIFY: fix typo in proximity example
