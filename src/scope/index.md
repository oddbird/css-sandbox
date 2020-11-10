---
title: Scope & Encapsulation
eleventyNavigation:
  key: scope
  title: Scope & Encapsulation
  parent: home
---

## Current/Past Specs

### [CSS Selectors - Level 4](https://www.w3.org/TR/selectors-4/) (Working Draft)

- [Scoped Selectors](https://www.w3.org/TR/selectors-4/#scoping)
  that only refer to a subtree or fragment of the document
- [Reference Element](https://www.w3.org/TR/selectors-4/#the-scope-pseudo)
  (`:scope`) pseudo-class
  (broad [browser support](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope))

In CSS, this is the same as `:root`, since there is no way to scope elements. However, it is used by JS APIs to refer to the base element of e.g. `element.querySelector()`

> “Specifications intending for this pseudo-class to match specific elements     rather than the document’s root element must define either a scoping root (if using scoped selectors) or an explicit set of :scope elements.”

### [CSS Scoping - Level 1](https://drafts.csswg.org/css-scoping/) (Editor’s Draft)

The [First Public Working Draft](https://www.w3.org/TR/css-scoping-1/)
included CSS `@scope` blocks. Scoping has two primary effects:

- The selector of the scoped style rule
  is restricted to match only elements within scope.
- The cascade prioritizes scoped rules over unscoped ones,
  regardless of specificity.
  - This results in proximity-weighting across scopes
  - But also means scope overrides everything

The latest draft is primarily concerned with Custom Elements & Shadow DOM…

### [CSS Cascade - Level 4](https://www.w3.org/TR/css-cascade-4/) (Working Draft)

- [Removes](https://www.w3.org/TR/css-cascade-4/#change-2018-drop-scoped)
  “scoping” from the cascade sort criteria,
  because it has not been implemented.
- Adds [encapsulation context](https://www.w3.org/TR/css-cascade-4/#cascade-context)
  to the cascade, for handling Shadow DOM
  - Outer context wins for *normal* layer conflicts
  - Inner context wins for `!important` layer conflicts

## Currently in Tools…

==TODO: cleanup this copypasta…==

Scoped Selectors
Used by CSS Modules, Vue, Styled-JSX, etc…
`.element[scope=component]`
CSS Proposals
Reference Selectors (CSSWG Proposal)
These are free-floating declaration blocks that can be applied to elements via JS API.

✅ The core idea is conceptually similar to @extends or mixins.
❌ Lexical scoping: This makes sense when I think about it from the JS end, but I think this is a really confusing idea when you think of it from the CSS side. Then again the entire proposal assumes…
❌ “Once a reference is defined in a CSS file must be imported into another context (eg HTML/JS) to be usable.” – I think this needs to be useful in CSS, or we’re missing out.
⁉️ HTML `css-refs="$foo"` I think is only attempting to apply scope? Otherwise this is just a new selector…

According to Giuseppe, one of the goals here is “Deterministic” resolution, based on the order references are applied, rather than relying on the cascade to resolve conflicts. Eg ref=”red blue” would return a different result than ref=”blue red”.

Another goal seems to be overriding specificity & source order - with a cascade weight similar to (Above? Below? Not clear…) inline-styles.
CSSWG Issue Thread
@scope with lower-bounds
Selector Boundaries
@scope with name & attribute
Yu Han
CSS Scoping Solutions Brainstorming
CSS Scoping Requirements
Idea Sandbox
https://gist.github.com/mirisuzanne/fdb7119203b6af0a195cd1d9c066dd3a

Questions
Do we need complex selectors to define scope?
Given a syntax of `@scope <selector>` are we placing any restrictions on the `<selector>`?

```css
/* In most cases we expect a single/simple selector to work */
@scope [data-component=tabs] { … }

/* Not sure there are strong use-cases for complex selectors */
@scope [data-component=tabs] li.tab-item { … }
```

Note: it might be more complicated to restrict selectors unless we have a good reason.
Where does scope fit in the cascade?
The original scope specification has scope override specificity in the cascade. (un-scoped styles are treated as-though scoped to the document-root):

> For normal declarations the inner scope's declarations override,
> but for ''!important'' rules outer scope's override.

But that behavior can be more easily handled using layers. I think we should un-couple scope from specificity/importance.
Option 1: No impact on cascade
The goal of scope is to narrow down the list of selectable elements, not necessarily to represent their importance relative to something else. We could define scope akin to media-queries, with no impact on cascading - only on filtering.

Both specificity & layers can be used in-conjunction with scope to control weighting when desired.
Option 2: The scoping selector
The specificity of the scope-selector itself could be added to each of the children, so that:

```css
/* `[data-component=tabs] .tab-item`: 0,2,0 */
@scope [data-component=tabs] { .tab-item { … } }

/* `#tabs .tab-item`: 0,2,0 */
@scope #tabs { .tab-item { … } }
```
Option 3: Make Proximity Meaningful
There is a CSS-issue that current scope solutions solve around proximity – concepts of “inner” and “outer” - which might belong in the cascade: https://twitter.com/keithjgrant/status/1123676335484952576


