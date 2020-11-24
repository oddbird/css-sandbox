---
title: Scope & Encapsulation
eleventyNavigation:
  key: scope
  title: Scope & Encapsulation
  parent: home
---

Authors often complain that CSS is "globrally scoped" --
so that every selector is compared against every DOM element.
While selectors allow you to filter the DOM tree to an extent,
the idea of "scope" would take that a bit farther.

But the idea is not well defined --
and different authors have very different ideas
of how this should work.

Some common expectations:

- Scopes can have a lower boundary ("donut" shape)
  to avoid bleeding into nested components
- Scopes are able to overlap/nest or "extend" each other
- Scope conflicts are resolved by _proximity_ rather than _source-order_ --
  with inner scope taking precedence when all else is equal

But scoping models disagree on:

- Can global selectors style inside an HTML-marked scope?
  (this concept requires an HTML attribute)
- If so, how much weight does scope add in the cascade?
- Should inheritance be blocked at the scope boundary?

The entire conversation has been delayed,
in part to see how Shadow-DOM changes the discussion.
I _think_ a declarative Shadow-DOM would help solve
some of the most strongly-isolated use-cases
(no bleed from the outer page),
leaving scope to focus on less-isolated components?

## Existing Specs

### [CSS Selectors - Level 4](https://www.w3.org/TR/selectors-4/) (Working Draft)

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

### [CSS Scoping - Level 1](https://drafts.csswg.org/css-scoping/) (Editor’s Draft)

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

### [CSS Cascade - Level 4](https://www.w3.org/TR/css-cascade-4/) (Working Draft)

- [Removes](https://www.w3.org/TR/css-cascade-4/#change-2018-drop-scoped)
  “scoping” from the cascade sort criteria,
  because it has not been implemented.
- Adds [encapsulation context](https://www.w3.org/TR/css-cascade-4/#cascade-context)
  to the cascade, for handling Shadow DOM
  - Outer context wins for *normal* layer conflicts
  - Inner context wins for `!important` layer conflicts

## Pior Art

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

Need to follow-up on these passing mentions
from an early meeting with Han:

- consider scoping attributes
- styling shadow DOM from the outer page
- donut scope
- avoid previous pitfalls
- consider specificity / media queries
- consider re-calc

### Reference selectors ([csswg issue](https://github.com/w3c/csswg-drafts/issues/3714))

These are free-floating declaration blocks
that can be applied to elements via JS API.

- ✅ The core idea is conceptually similar to Sass
  `%placeholder`/`@extends` and `mixins`
  that have no impact until they are explicitly applied
- ❌ Lexical scoping makes sense when I think about it from the JS end,
  but I think this is a really confusing idea
  when you think of it from the CSS side.
  Then again the entire proposal assumes…
- ❌ “Once a reference is defined in a CSS file
  it must be imported into another context (eg HTML/JS) to be usable.”
  I think this needs to be useful in CSS, or we’re missing out.
- ⁉️ HTML `css-refs="$foo"` I think is only attempting to apply scope?
  Otherwise this is just a new selector...

According to [Giuseppe](https://github.com/w3c/csswg-drafts/issues/3714#issuecomment-474248269),
one of the goals here is “Deterministic” resolution,
based on the order references are applied,
rather than relying on the cascade to resolve conflicts.
Eg `ref=”red blue”` would return a different result than `ref=”blue red”`.

Another goal seems to be overriding specificity & source order -
with a cascade weight similar to (Above? Below? Not clear…) inline-styles.

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

Is that the distinction we care about?

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
with only minor syntax changes:

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

(Thisw could be combined with either of the above options)

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
