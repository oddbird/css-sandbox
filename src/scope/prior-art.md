---
title: Prior Art
created: 2021-10-05
eleventyNavigation:
  key: scope-history
  title: Prior Art
  parent: scope
---

## Existing Specifications

### [CSS Selectors - Level 4](https://www.w3.org/TR/selectors-4/)

- [Scoped Selectors](https://www.w3.org/TR/selectors-4/#scoping)
  that only refer to a subtree or fragment of the document

  > When a selector is scoped, it matches an element
  > only if the element is a descendant of the scoping root.
  > (The rest of the selector can match unrestricted;
  > it’s only the final matched elements that must be within the scope.)

- [Reference Element](https://www.w3.org/TR/selectors-4/#the-scope-pseudo)
  (`:scope`) pseudo-class
  (broad [browser support](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope))

In CSS, this is the same as `:root`, since there is no way to scope elements. However, it is used by JS APIs to refer to the base element of e.g. `element.querySelector()`

> “Specifications intending for this pseudo-class to match specific elements
> rather than the document’s root element
> must define either a scoping root (if using scoped selectors)
> or an explicit set of :scope elements.”

### [CSS Scoping - Level 1](https://drafts.csswg.org/css-scoping/)

The latest draft is primarily concerned
with Custom Elements & Shadow DOM.

The [First Public Working Draft](https://www.w3.org/TR/css-scoping-1/)
had more scoping features that have since been removed:

A `<style scoped>` attribute,
which would apply to sibling elements and their descendants.
This had a few limitations:

- Need to repeat in the DOM for every instance of the scope
- Need a distinct stylesheet for each scope

It also included CSS `@scope` blocks,
which would help alleviate both issues.
Scoping has two primary effects:

- The selector of the scoped style rule
  is restricted to match only elements within scope.
- The cascade prioritizes scoped rules over un-scoped ones,
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

## Ecosystem

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
- Proximity-weight is achieved only through limiting the donut of scope
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
