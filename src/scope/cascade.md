---
title: Scope in the Cascade
eleventyNavigation:
  key: scope-cascade
  title: In the Cascade
  parent: scope
---

There are two primary ways to think about "scope" in CSS,
which represent different goals.

1. _Contain_ scoped styles so they have no global impact
   (no styles get out)
2. _Isolate_ scoped styles from any global influence
   (no styles get in)

The first can be managed through
upper and lower _scope boundaries_,
but the second ideally requires some understanding
of the DOM nesting relationships
between inner and outer scopes --
what I am calling _proximity_.

Given two scopes,
and a target element that is inside both,
the innermost scope has higher proximity:

```html
<main data-scope="outer">
  <section data-scope="inner">
    <a>target element inside both scopes</a>
  </section>
</main>
```

Popular CSS tools (CSS modules, Vue scoped styles, etc)
and conventions (BEM, etc)
have put their entire focus on the goal of _containment_,
while previous CSS proposals
(and existing Shadow-DOM context)
have been designed
to link both goals under a single name --
making scope much more "heavy-handed" in the Cascade.

My [Scope proposal](../explainer/)
(following the lead of existing tools)
puts a strong priority on containment.
But I also recognize use-cases --
like nested themes --
where it is also useful to allow overlapping scopes,
and give _proximity_ some weight in the cascade.

## The Problem

This idea of "proximity" weight is a heuristic
that represents a similar assumption to "specificity":
component details are _likely_ to be more targeted,
and more important than global defaults.
So we give more weight to more targeted selectors (specificity),
and we may also give some weight to more nested scopes (proximity).

But we know that neither heuristic is universally accurate.
Sometimes high specificity is required for general styles,
and similarly,
generic scopes might be required for style-containment,
without any desire for style-isolation.
This is why we're also working on
a more explicit `@layer` functionality.

Both heuristics are useful,
but not entirely reliable.
The question is:
should _scope proximity_ override _specificity_,
or the other way around?

## Considerations

### The implications on author control

Scope Proximity is controlled by the DOM tree,
and is largely invisible
to a CSS author writing modular styles.
Selector specificity
is established clearly in the CSS itself,
and applied consistently
no matter how the DOM is shaped.

Many projects keep specificity
intentionally flat & low-weight when possible,
meaning source-order currently takes precedence
in most conflicts.
That works because
authors prefer to avoid conflicts in the first place --
something scope containment will help with.

Authors also have existing tools & conventions
(`:is()`, `:where()`, `[id]`, & BEM syntax)
that can be used to manage specificity
to some degree.
The same is not true of proximity.

**If proximity takes priority** ("strong scope"),
then the specificity of a selector
only matters in relation to other selectors
at the same proximity.
Selectors that were previously designed
to have higher or lower specificity,
will suddenly cascade
in unexpected & unreliable ways
based on DOM structures defined outside of CSS.
Any high-priority global selectors
would need to rely on explicit `@layer` rules
in order to override more narrowly scoped styles.

**If specificity takes priority** ("weak scope"),
it can continue to be used in much the same way as before
(with `@layers` adding more explicit customization) --
and proximity will begin to apply
only in those situations where flat specificity
and overlapping scopes allow a conflict.
In my experience so far,
it is common for similar scope-types,
to use similar scoping selectors.

Proximity would still provide
a better fallback heuristic than source-order,
without fundamentally changing the way
specificity currently works.

I see the latter option
as a much smoother path forward,
and a better match
with existing tools & conventions.

### Comparisons to lexical scope

Many programming languages (including Sass & JS)
have a concept of _lexical scope_,
both at the document/module level,
and within code structures.

In those cases,
scope primarily helps resolve
naming conflicts.
If a function, mixin, or variable name
is allowed to "bleed" across scopes,
it might interfere with another feature
of the same name.

(This would be similar to CSS scope
only resolving conflicts between selectors
that have the same exact name)

Lexical scopes tend to be
clearly defined and nested.
The relationship between scopes
is visible in the document,
and there may even be tools to explicitly
allow cross-scope references when needed
(see JS & Sass module imports/exports,
and the `!global` flag for Sass variables).

The same is generally true of
Shadow-DOM "isolation context"
where the scope is defined
by a discrete DOM fragment.
The shadow scope is always nested
inside a host document scope,
and the relationship is clear.
Styles on either side
have limited but clear ways
to penetrate that boundary.

Inline styles
are also applied directly to a single element,
and given priority
over more "global" stylesheet declarations.
That can be seen as a form of lexical scope as well,
based on where the style is defined.

In all these cases,
the scopes have clearly defined parent/child relationships
that are visible in the code.
It makes sense for the clearly defined parent or child
to consistently take precedence.

But those structures & relationships
are not at all clear
in the many-to-many situation described
by selectors,
which will be used to establish CSS scope.
The relationship between two selectors
can take any number of shapes --
alternating parent/child relationships
in unexpected ways,
or sometimes describing the exact same element
in unison.

None of that is clear by looking at the CSS alone,
and it's one reason we have specificity --
which we can control & define
without reference to the DOM.

It will not necessarily be clear
how all the scopes in a stylesheet
are expected to overlay and interact.
The parent/child/unison relationships
are likely to change in unpredictable ways --
and authors will need to rely on other tools
that better express the _weight_ of a scoped rule.

We can either limit that to
the new (high-level) `@layer` blocks,
or allow them to use selector specificity as well.

### Scope in existing tools

The primary solution I've seen
was invented (if I understand correctly)
by [CSS Modules][modules],
and adapted by other tools.
Using JavaScript as a preprocessor
for both the CSS & HTML output,
classes are transformed to
make selectors unique within a scope:

```html
<!-- input html -->
<h1 css-module="title">postcss-modules</h1>

<!-- output html -->
<h1 class="_title_xkpkl_5">postcss-modules</h1>
```

```css
/* input CSS */
:global(.title) { /* specificity [0,1,0] */
  color: red;
}

:local(.title) { /* specificity [0,1,0] */
  color: green;
}

/* output CSS */
.title { /* specificity [0,1,0] */
  color: red;
}
._title_xkpkl_5 { /* specificity [0,1,0] */
  color: green;
}
```

When complex selectors are used,
each selector part is transformed individually.

The result is:

- Ownership is established through unique identifiers --
  (avoid styles leaking out)
- No change to specificity
- No change to internal vs external (proximity) priority
- No impact on priority of global vs local styles

Vue scoped styles adapt this approach,
but use an _additional_ unique attribute
rather than transforming the original attributes:

```html
<!-- input html -->
<h1 class="title">postcss-modules</h1>

<!-- output html -->
<h1 class="title" data-xkpkl>postcss-modules</h1>
```

```css
/* global CSS */
.title { /* specificity [0,1,0] */
  color: red;
}

/* scoped CSS */
.title { /* specificity [0,1,0] */
  color: green;
}

/* output CSS */
.title { /* specificity [0,1,0] */
  color: red;
}
.title[data-xkpkl] { /* specificity [0,2,0] */
  color: green;
}
```

- Ownership is established through unique attributes --
  (avoid styles leaking out)
- Specificity is increased by a single attribute
- No change to internal vs external (proximity) priority
- Global styles need additional attribute specificity (minimum)
  in order to override scoped styles

These tools also tend to…

- Create non-overlapping (or minimally-overlapping) scopes
- Encourage scoping all component styles
- Output global styles first in the source order

The result is that scoped styles _generally_
override global styles of the same specificity,
but it is easy to increase global specificity when desired
to override scoped styles.

### Migration path

My proposal would be able to replicate either/both outcomes --
or provide their own desired specificity behavior --
by allowing the author to establish a "scope specificity"
in addition to the "selector specificity"
of each selector block:

```css
.title { color: red; } /* specificity [0,1,0] */
.title.special { color: purple; } /* specificity [0,2,0] */

@scope (:where(.article)) to (.lower-bounds) {
  .title { /* specificity [0,1,0] */
    color: green;
  }
}
@scope (.article) to (.lower-bounds) {
  .title { /* specificity [0,2,0] */
    color: green;
  }
}
@scope (#article) to (.lower-bounds) {
  .title { /* specificity [1,1,0] */
    color: green;
  }
}
```

Additionally,
I would give priority to scope proximity
_when specificity is equal_.
In this example,
the global `.title.special`
would be able to override the first (zero-specificity-root) scope.

- Ownership is established through lower-boundary selectors --
  (avoid styles leaking out)
- Specificity is controlled by the author
- Internal scope gets priority _when specificity is equal_
- Global styles _may_ need additional specificity
  to override scoped styles

All existing tools would be able to auto-generate
`@scope` rules that match their current behavior
in terms of both _ownership_
(lower-boundaries replace unique attributes)
& _specificity_
(by generating an appropriate root selector).

The only difference would be
that scoped styles are given a slight bump in priority
_when specificity is equal_.

That would take the existing "most common" behavior,
and give it more reliable nesting,
without dramatically changing the interaction with global styles.

It's also common in the current tools
to generate non-overlapping scopes.
That can be quickly reproduced
with a naming-convention,
or custom attribute,
that is used to establish both scope roots,
and lower-boundaries:

```css
@scope ([data-scope=media]) to ([data-scope]) {
  /* never flow into another scope */
}
```

Automated tools would be able to simplify their output,
only generating attributes on the root of each scope.
That simpler output is also more easy
to reproduce by hand,
and extend as needed.

For most authors,
classes and attributes make up the vast majority of selectors,
and the most common results of a scope
will be similar to Vue:
a root specificity of `[0,1,0]`
added to the specificity of individual scoped selectors.

Since that also matches the specificity behavior of nesting,
I expect it to be an easy concept to learn & teach.

## Use cases

I was asked to show different use-cases
for "high vs low powered proximity" in the cascade --
placing scope proximity "above" or "below" specificity
in the cascade.
I've tried to do that here with a few examples
that show proximity is sometimes useful,
and sometimes not.

But in either case,
authors should be able to achieve all these desired outcomes
with some combination of scope, specificity, and cascade layers.
In my mind the more important goal is to
_give authors explicit control over that choice_.

### Fantasai's example

Fantasai raised this use-case on the CSSWG telecon:

> fantasai: Example: I have a sidebar in my page
> and want it to have a different color.
> Inverse contrast color.
> I have rules setting link color heading color etc.
> Need to override them all in my sidebar.
> I override the link and say it's light.
> Overall outer page has
> slightly different colors for links in a list.
> B/c that's higher specificity it overrides the sidebar.

I implemented this in codepen,
and it is possible to re-create the scenario:

<p class="codepen" data-height="363" data-theme-id="39098" data-default-tab="css,result" data-user="miriamsuzanne" data-slug-hash="1235d3af7fd584d4f9471b90735a38ec" style="height: 363px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="1235d3af7fd584d4f9471b90735a38ec">
  <span>See the Pen <a href="https://codepen.io/miriamsuzanne/pen/1235d3af7fd584d4f9471b90735a38ec">
  1235d3af7fd584d4f9471b90735a38ec</a> by Miriam Suzanne (<a href="https://codepen.io/miriamsuzanne">@miriamsuzanne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

(It took some work to make
the specificity of a global link-in-a-list style
override the specificity of a "scoped" link-in-a-sidebar.
Either my scoping selector has to be surprisingly weak,
or my global style has to be fairly specific.
But we can set that aside for now.)

While this case demonstrates
the potential for specificity to give a bad result,
neither heuristic actually provides a satisfactory resolution.
If we gave preference to proximity,
we would lose the link-in-list pattern entirely.
I'm not convinced that's an obvious improvement.

Really what we want is
for the author to clarify their intentions:

- If the link-in-list styles should not be applied inside other scopes...
  - We can scope the `link-list` class
    with appropriate lower boundaries
- If the link-in-list pattern is global,
  but low-priority & disposable...
  - It probably shouldn't have
    such a high specificity in the first place
  - Or it might belong in a lower "defaults" layer
- If our sidebar really should override global patterns...
  - We could clarify that
    with more specificity on the scope
  - Or put it in a "components" layer
    above a "globals" layer
- If both are equal in weight,
  but we want proximity to select the better option...
  - We can give them equal specificity scopes
- If link-in-list should get custom styles for the overlapping case...
  - We should define how that pattern adapts within the scope

All of these solutions help to clarify what we meant,
and how we intend these patterns to interact.
None of them are hacks.
Authors can use various combinations of scope, specificity, and layers
to convey their intent.

On the other hand,
if we give proximity total priority
over specificity,
`@layer` becomes the _only tool available_
for managing different intentions.

Fantasai also says:

> If you switch class to ID
> it can completely destroy relationship between selectors.

I'd argue that's the _expected behavior_ for authors --
which they are very familiar with --
and exactly the purpose of specificity as a heuristic.
I don't see a good reason for `@scope` to change that,
when we already have
both `@layer` and `:where()`
to help authors manage their specificity more explicitly.

We can dig into some of those cases
with a bit more detail.

### Global & scoped themes

In the previous example,
light mode is the global default theme,
and dark-mode is a scoped "inversion" of the theme.

If we base the inversion on a class (like `.invert`),
proximity and specificity would give us the same priority result here.
While that seems reasonable to me,
I'll give the inversion a lower specificity,
so we can see the potential conflict between them:

```css
html {
  background: white;
  color: black;
}

a:any-link { color: darkmagenta; }

@scope (aside) {
  :scope {
    background: white;
    color: black;
  }
}
```

This creates a broken state either way:

- If proximity takes precedence,
  we've removed all color-differentiation from our links.
- If specificity takes precedence,
  we'll get dark links on a black background.

And either way,
the issue is resolved
by clarifying our intent for links
in the inverted scope:

```css
html {
  background: white;
  color: black;
}

a:any-link { color: darkmagenta; }

@scope (aside) {
  :scope {
    background: white;
    color: black;
  }

  /* both higher specificity & closer proximity */
  a:any-link { color: violet; }
}
```

This is very similar
to the way authors currently handle
the overlap of styles,
without scope:

```scss
html {
  background: white;
  color: black;
}

a:any-link { color: darkmagenta; }

aside {
  background: white;
  color: black;

  /* higher specificity */
  & a:any-link { color: violet; }
}
```

Specificity is already designed
to give contextual styles more weight
over global defaults.
Adding proximity as an override to specificity
would not solve the problem more easily.

### Light & dark theme scopes

Another option would be to define multiple scoped "themes" --
such as light- and dark-mode --
which can be nested indefinitely.
This is a case where we clearly want
the inner (more proximate) scope to win,
but also a case where
I would expect the theme selectors
to provide equal specificity:

```css
@scope (.light) {
  :scope {
    background: white;
    color: black;
  }

  a:any-link { color: purple }
}

@scope (.dark) {
  :scope {
    background: white;
    color: black;
  }

  a:any-link { color: plum; }
}
```

Since the specificities match,
proximity becomes the deciding factor.
For extra caution,
we can also ensure these scopes never overlap,
avoiding all conflicts between them:

```css
@scope (.light) to (.dark) { … }
@scope (.dark) to (.light) { … }
```

### Themes and components

Unlike DOM-isolation approaches (eg shadow-DOM),
we can also end-up combining broad patterns
(like themes)
with more contained components
(like a specialized link-list style).

There's not necessarily a clean delineation here,
but in some sense these scopes
belong in different "layers" of a design system
(as per the ITCSS convention or the `@layer` spec).

For a smaller component like a list,
it will generally be "inside" one theme or another.
If both the theme and component are scoped,
and both scopes apply,
the more narrowly defined component
is likely to be "more proximate" for items in the list.

But there are use-cases where they overlap
in unpredictable ways:

- A tab component could be nested inside a light-theme,
  but contain a dark-theme inside one of the tab contents.
- A card component could be assigned a theme directly,
  making both the theme & component "equal" in proximity.

Authors will need tools
to manage the priority of these relationships
in a more consistent way.

## Conclusion

My argument is not that one or the other has "more" use-cases,
but that:

- the proximity heuristic is _no more reliable_
  than the existing specificity heuristic.
- only specificity relationships are clear in the CSS,
  without reference to the DOM structure
- existing tools already provide scope as a useful tool,
  without overriding specificity

By allowing specificity to take precedence,
scope can be integrated more smoothly in existing projects,
and the relative weight of each selector
remains clearly visible in the CSS.

In my mind,
the purpose of a global scope is
_explicitly to apply everywhere_,
and the purpose of a narrower scope is
_to constrain where some styles apply_.

The argument for strong scope
assumes that the goal of scope (constraint)
_always aligns_ with
a secondary desire to write "higher priority" styles,
which override any more global patterns.

I find that assumption entirely unreliable,
and unfounded in CSS.
There is no reason to assume that global styles
are low-priority compared to scoped styles.

Meanwhile
low-powered scope
allows authors
to avoid those conflicts in the first place
(through containment, where desired) --
while balancing proximity, specificity, and layers,
in ways that are obvious in the CSS,
and integrate smoothly
with current tools & conventions.
