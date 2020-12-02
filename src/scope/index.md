---
title: Scope & Encapsulation
eleventyNavigation:
  key: scope
  title: Scope & Encapsulation
  parent: home
---

Authors often complain that CSS is "globally scoped" --
so that every selector is compared against every DOM element.

There are several overlapping concerns here,
based on a wide range of use-cases --
and they can quickly become confused.
That has lead to a wide array of proposals
that are sometimes working towards different goals.

In the meantime,
the CSSWG conversation has been stalled --
in part to see how Shadow-DOM changes things.

Looking at the state of things now,
my sense is that
both shadow-DOM
and the abandoned "scope" specification
were focused around strong isolation use-cases --
which Shdaow-DOM has now partly addressed:

- Declarative Shadow-DOM would help make that more widely usable
- People want better ways to style across the shadow-boundary
- There may also be use-cases for similar "isolated scope" in light DOM

Meanwhile,
there are many use-cases for "scope"
that would require a much lighter touch.
I've been mainly interested in those low-isolation problems,
but this document contains notes on both.

## Existing specs that mention scope

### [CSS Selectors - Level 4](https://www.w3.org/TR/selectors-4/)

- [Scoped Selectors](https://www.w3.org/TR/selectors-4/#scoping)
  that only refer to a subtree or fragment of the document

  > When a selector is scoped, it matches an element
  > only if the element is a descendant of the scoping root.
  > (The rest of the selector can match unrestricted;
  > ==it’s only the final matched elements that must be within the scope==.)

- [Reference Element](https://www.w3.org/TR/selectors-4/#the-scope-pseudo)
  (`:scope`) pseudo-class
  (broad [browser support](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope))

In CSS, this is the same as `:root`, since there is no way to scope elements. However, it is used by JS APIs to refer to the base element of e.g. `element.querySelector()`

> “Specifications intending for this pseudo-class to match specific elements     rather than the document’s root element must define either a scoping root (if using scoped selectors) or an explicit set of :scope elements.”

### [CSS Scoping - Level 1](https://drafts.csswg.org/css-scoping/)

The latest draft is primarily concerned
with Custom Elements & Shadow DOM.

The [First Public Working Draft](https://www.w3.org/TR/css-scoping-1/)
had more scoping features that have since been removed:


A `<style scoped>` attribute,
which would apply to sibling elements and their decendants.
This had a few limitations:

- Need to repeat in the DOM for every instance of the scope
- Need a distinct stylesheet for each scope

It also included CSS `@scope` blocks,
which would help alleviate both issues.
Scoping has two primary effects:

- The selector of the scoped style rule
  is restricted to match only elements within scope.
- The cascade prioritizes scoped rules over unscoped ones,
  regardless of specificity.
  - This results in proximity-weighting across scopes
  - But also means scope overrides everything

### [CSS Cascade - Level 4](https://www.w3.org/TR/css-cascade-4/)

- [Removes](https://www.w3.org/TR/css-cascade-4/#change-2018-drop-scoped)
  “scoping” from the cascade sort criteria,
  because it has not been implemented.
- Adds [encapsulation context](https://www.w3.org/TR/css-cascade-4/#cascade-context)
  to the cascade, for handling Shadow DOM
  - Outer context wins for *normal* layer conflicts
  - Inner context wins for `!important` layer conflicts

## The scope of scoped CSS

### The "namespace" problem

All CSS Selectors are global,
matching against the entire DOM.
As projects grow,
or adqapt a more modular "component-composition" approach,
it can be hard to track what names have been used,
and avoid conflicts.

To solve this,
authors rely on
convoluted naming conventions (BEM)
and JS tooling (CSS Modules & Scoped Styles)
to "isolate" selector names inside a single component.

That may partly be solved by ancestor selectors,
but that raises additional issues…

### The nearest-ancestor "proximity" problem

Ancestor selectors already allow us to
filter the "scope" of nested selectors
to a sub-tree in the DOM:

```css
/* link colors for light and dark backgrounds */
.light a { color: purple; }
.dark a { color: plum; }
```

But problems show up quickly
when you start thinking of these as modular styles
that should nest in any arrangement.

```html
<div class="dark">
  <a href="#">plum</a>

  <div class="light">
    <a href="#">also plum???</a>
  </div>
</div>
```

Our selectors appropriately have the same specificity,
but they are not weighted by
"proximity" to the element being styled.
Instead we fallback to source order,
and `.dark` will always take precedence.

There is no selector/specificity solution
that accurately reflects what we want here --
with the "nearest ancestor" taking precedence.

This was one of the
[original issues highlighted by OOCSS][oocss-proximity]

[oocss-proximity]: https://www.slideshare.net/stubbornella/object-oriented-css/62-CSS_WISH_LIST

### The lower-boundary, or "ownership" problem ("donut scope")

While "proximity" is loosely concerned with nesting styles,
the problem comes into more focus
with the concept of modular components --
which can be more complex.

To use BEM terminology,
Components are generally comprised of:

- An outer "block" component wrapper
- Inner "elements" that belong to that block explicitly

In html templating languages,
and JS frameworks,
this can be represented by an "include"
or "single file component".

BEM is useful in establishing ownership in CSS:

```css
/* any title inside the component tree */
.component .title { /* too broad */ }

/* any title inside the component tree */
.component > .title { /* too limiting of DOM structures */ }

/* just the title of the component */
.component__title { /* just right! */ }
```

JS frameworks automate this process
with single file components --
but it would be useful to express "ownership" more clearly
in native HTML/CSS.

Nicole Sullivan coined the term
["donut" scope][donut] for this issue in 2011.

[donut]: http://www.stubbornella.org/content/2011/10/08/scope-donuts/

### Fully isolated styles

There is a more extreme use-case,
often used for widgets that should appear unchanged
across multiple projects --
but sometimes used for component libraries
on larger projects.

Full isolation blocks off a section of the DOM,
so that it _only_ accepts styles that are
explicitly scoped.
General page styles do not apply.

I don't think this is the most common concern,
but it has recieved the most attention.
Shadow DOM is entirely constructed around this behavior,
and the initial unimplemented scope spec
built on a similar premise (with some hybrid flexibility).

[Yu Han](#yu-han’s-notes-%26-proposal) has
an interesting proposal
for improving on the Shadow DOM approach,
and making it available in the light DOM.
That requires a new `scoped` HTML attribute,
because that sort of isolation has to be defined on the element itself.

I have not attempted to address this type of scope in my proposal,
because it feels like a significantly different issue
that already has work underway.

## Pior art

### Naming conventions (BEM)

To show that `.element`
is not just _inside_ `.block`,
but _belongs to it_ --
BEM requires authors to manually namespace one class
using both names:

```css
/* .element scoped to .block */
.block-element { /* ... */ }
```

### JS tools & frameworks

CSS Modules, Vue, Styled-JSX, and other tools often use a similar pattern
(with slight changes to syntax):

```css
/* a component & it's children get a unique attribute to select against */
.component[scope=component] { /* ... */ }
.element[scope=component] { /* ... */ }

/* nested component containers are part of both outer & inner scope */
.sub-component[scope=component],
.sub-component[scope=sub-component] { /* ... */ }

/* but elements inside a nested component only have inner scope */
.sub-element[scope=sub-component] { /* ... */ }
```

- The donut is achieved by selectively adding attributes
- Proximity-weight is achieved only thorugh limiting the donut of scope
- Added selector gives scoped styles _some_ (but very little)
  extra specificity weight in the cascade

### CSSWG draft issues

- [Bring Back Scope](https://github.com/w3c/csswg-drafts/issues/3547):
  - [@scope with lower-bounds](https://github.com/w3c/csswg-drafts/issues/3547#issuecomment-524206816)
  - [@scope with name & attribute](https://github.com/w3c/csswg-drafts/issues/3547#issuecomment-693022720)
- [Selector Boundaries](https://github.com/w3c/csswg-drafts/issues/5057)
- [CSS Namespaces](https://github.com/w3c/csswg-drafts/issues/270)
  - And stated [priorities](https://github.com/w3c/csswg-drafts/issues/270#issuecomment-231586786)

### Yu Han's notes & proposal

- [CSS Scoping Requirements](https://docs.google.com/document/d/1OdrepVuj5EIccnd5sSkUSiwPOL0fBEly6KVRxobcJko/edit)
- [CSS Scoping Solutions Brainstorming](https://docs.google.com/document/d/1hhjmuQE6BTTnAyKP3spDr8sU6lpXArh8LDfihZh78hw/edit)

This proposal has two parts,
designed to build on top of existing shadow DOM logic.

1. Allow shadow-DOM elements to opt-in to global styles
2. Allow light-DOM elements to opt-in to style isolation

## Possible syntax

I like this general direction proposed by Giuseppe --
which builds on the original un-implimented spec,
but adds lower boundaries:

```css
@scope (from: .carousel) and (to: .carousel-slide-content) {
  p { color: red }
}
```

I wonder if `from` can be implicit & required.
Something like…

```css
@scope (.carousel) to (.carousel-slide-content) {
  p { color: red }
}
```

## Questions

### Does this really help with name conflicts?

The scope itself requires some form of naming/selecting,
which can't be forced-unique --
so in many ways,
the name-conflicts should be similar to simple nested selectors:

```css
@scope (.block) {
  .element { /* ... */ }
}

/* .element is already scoped to .block in a sense… */
.block .element { /* ... */ }
```

The difference becomes more clear
when you consider lower boundaries:

```css
@scope (.block) to (.nested) {
  /* this will NOT select any .element inside .nested */
  .element { /* ... */ }
}

/* this will select any .element, EVEN inside .nested */
.block .element { /* ... */ }
```

I assume that's the distinction we care about?
I do think that would be enough to limit naming conflicts
to the component root (scoping) selectors.

### How does scope relate to nesting?

https://drafts.csswg.org/css-nesting/

The goal of nesting is primarily
to clean up document structure,
and make it more readable --
primarily a syntax issue.

Scope has a much more complicated set of goals,
around limited selector-matching
and namespacing.

But both help to describe the relationship
between parent & child selectors.
While it might be a mistake to make one rely on the other --
they clearly have some overlap.

### Are scope attributes useful in html?

Yu Han's proposal requires a scope attribute in HTML
because the full-isolation use-case
would require elements to opt-in or out of global page styles.
But is it required or useful for less isolated use-cases?
It does come up regularly,
as a form of syntax sugar.
From [Sebastian](https://github.com/w3c/csswg-drafts/issues/3547#issuecomment-693022720):

```css
p { color: blue; }

@scope main {
  p { color: green; }
}
@scope note {
  p { color: gray; }
}
```

```html
<p>This text is blue</p>
<section scope="main">
  <p>This text is green</p>
  <div scope="note">
    <p>This text is gray</p>
  </div>
</section>
<div scope="note">
  <p>This text is gray</p>
</div>
```

I think you could achieve the same goal manually,
with only minor syntax changes --
so at this point I'm not convinced we need it:

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

### Do we need complex selectors to define scope?

Given a syntax of `@scope <selector>` are we placing any restrictions on the `<selector>`?

```css
/* In most cases we expect a single/simple selector to work */
@scope [data-component=tabs] { /* ... */  }

/* Not sure there are strong use-cases for context selectors */
@scope .page-context [data-component=tabs] { /* ... */ }
@scope [data-component=tabs].horizontal { /* ... */ }

/* modifiers could be handled internally */
@scope [data-component=tabs] {
  .page-context :scope { /* ... */ }
  :scope.horizontal { /* ... */ }
}
```

Counter-point: is there a reson to dis-allow complex selectors?

### Where does scope fit in the cascade?

The original scope specification
had scope override specificity in the cascade.
Un-scoped styles are treated as-though scoped to the document-root:

> For normal declarations the inner scope's declarations override,
> but for ''!important'' rules outer scope's override.

But I think we should un-couple scope from specificity/importance.
That behavior can be more easily controlled using cascade layers.

There would be several non-exclusive options:

#### Option 1: No impact on cascade

The goal of scope is to narrow down the list of selectable elements,
not necessarily to represent their importance relative to global styles.
We could define scope akin to media-queries,
with no impact on cascading -- only on filtering.

Both specificity & layers can be used in-conjunction with scope
to control weighting when desired.

#### Option 2: The scoping selector

The specificity of the scope-selector itself
could be applied to the specificity of each nested selector, so that:

```css
@scope [data-component=tabs] {
  /* `[data-component=tabs] .tab-item`: 0,2,0 */
  .tab-item { /* ... */ }
}

@scope #tabs {
  /* `#tabs .tab-item`: 1,1,0 */
  .tab-item { /* ... */ }
}
```

#### Option 3: Make Proximity Meaningful

There is a CSS-issue that current scope solutions solve around proximity --
concepts of “inner” and “outer” --
which might belong in the cascade:

https://twitter.com/keithjgrant/status/1123676335484952576

My instinct would be to add _proximity_
below specificity in the cascade,
but above source-order.
That would allow scopes to be re-arranged safely,
without any impact on existing specificity rules.

(This could be combined with either of the above options)

#### Option 4: Importance-relative layering

Both the initial scope specification,
and the current Shadow-DOM encapsulation-context approach
put the scope-proximity above/before specificity in the cascade,
and relative to importance.
Specificity is not considered unless there is a tie
at the scope/importance level...

Shadow encapsulation is designed
to treat normal styles as the "default"
which an outer page can easily override.
This matches the behavior we would expect from
browser-defined components:

- normal: outer page wins
- important: inner context wins

Scope was designed in the reverse,
so that inner context would override outer context
unless marked as important.
This matches the expectation that
proximity should take priority when describing components:

- normal: inner scoped component wins
- important: outer page can take over

❌ I don't like this interplay of
importance with scope,
or the priority of scope _over and above_ specificity.
This approach is trying to infer too much
about the styles based on their scope.
I would hand this power off to [Cascade Layers](/layers/),
and allow scope to have much lower weight in the cascade --
untangled from importance.
