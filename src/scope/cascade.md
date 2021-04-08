---
title: Scope in the Cascade
eleventyNavigation:
  key: scope-cascade
  title: In the Cascade
  parent: scope
---

There are two primary ways to think about "scope" in CSS,
which represent different goals.

1. Keep scoped styles **from escaping scope** --
   by expressing a scope of _ownership_
   through root & lower-boundary selectors.
2. Keep global styles **from overriding scoped styles** --
   by giving _proximity_ the power to override
   specificity in the cascade.

Popular CSS tools (CSS modules, Vue scoped styles, etc)
and conventions (BEM, etc)
have put their entire focus on the first goal,
while previous CSS proposals have been designed
to link both goals under a single name --
making scope much more "heavy-handed" in the Cascade.

Both "specificity" and "proximity" are heuristics
that represent different aspects of the same assumption:
details are _likely_ to be more targeted than defaults.
We know that's not universally true in either case,
which is why we're now providing
a more explicit `@layer` functionality.

Still, the heuristics are useful,
and one of them needs to take precedence.

## Context

Proximity is defined by the DOM,
and is largely invisible
to a CSS author writing modular styles.
Selectors that were previously designed
to have higher or lower specificity,
will suddenly cascade
in unexpected & unreliable ways
based on DOM structures.

If proximity takes priority,
then the specificity of a selector
only matters in relation to other selectors
at the same proximity.
Global selectors would need to rely on explicit `@layer` rules
if they are intended to have global impact.

Meanwhile,
Selector specificity
is established in the CSS,
and applied consistently
no matter how the DOM is shaped.
It provides authors with more control
over the way a system is applied.

Many projects keep specificity
intentionally flat & low-weight when possible,
meaning source-order currently takes precedence
in most conflicts.
That works because
authors prefer to avoid conflicts in the first place --
something scope will help with.

If specificity takes priority,
it can continue to be used in much the same way as before
(with `@layers` to add more customization) --
and proximity will begin to apply
only in those situations where flat specificity
and overlapping scopes allow a conflict.
It provides a better fallback heuristic than source-order,
without fundamentally changing the way specificity applies.

I see the latter option
as a much smoother path forward,
and a better match
with existing tools & conventions.

### Lexical scope comparisons

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

### My existing proposal

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

### Migration path

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
and give it more reliable consistency,
without dramatically changing the implications.
While we continue relying on specificity,
we no longer rely on source-order.

For authors that are migrating by hand,
classes and attributes make up the vast majority of selectors,
and the most common results will be similar to Vue:
a root specificity of `[0,1,0]`
added to the specificity of individual selectors.

Since that also matches the specificity behavior of nesting,
I expect it to be an easy concept to learn & teach.

## Use cases

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

<p class="codepen" data-height="363" data-theme-id="39098" data-default-tab="css,result" data-user="mirisuzanne" data-slug-hash="1235d3af7fd584d4f9471b90735a38ec" style="height: 363px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="1235d3af7fd584d4f9471b90735a38ec">
  <span>See the Pen <a href="https://codepen.io/mirisuzanne/pen/1235d3af7fd584d4f9471b90735a38ec">
  1235d3af7fd584d4f9471b90735a38ec</a> by Miriam Suzanne (<a href="https://codepen.io/mirisuzanne">@mirisuzanne</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

But it took some work to make
the specificity of a global link-in-a-list style to
override the specificity of a "scoped" link-in-a-sidebar.
Either my scoping selector has to be surprisingly weak,
or my global style has to be fairly specific.

Fantasai also says:

> If you switch class to ID
> it can completely destroy relationship between selectors.

I'd argue that's exactly the purpose of specificity as a heuristic,
it's the _expected behavior_ for authors,
and there's no reason for `@scope` to change that.

In this case,
the author needs to clarify their intentions:

- If we're talking about a low-priority link-in-list pattern...
  - That probably shouldn't have a high specificity
  - If it needs higher specificity for some reason,
    it could go in a lower "defaults" layer
- If our sidebar is special,
  and really should override global patterns...
  - We probably want to clarify that with more specificity
  - Or put it in a "components" layer
    above a "defaults" layer
- If link-lists should get custom styles in any context,
  we should define both variants of the pattern...
  - Clearer selectors will likely result in equal specificity,
    or even higher specificity in the more specific context
  - We could use a contextually set custom property,
    which would inherit from the more narrow context
- If we want to ignore `link-list` colors inside a sidebar...
  - Then we can scope the `link-list` class with a lower boundary

All of these solutions help to clarify what we meant,
and what we intended.
None of them are hacks.

Let's take a closer look at the options.

### Global & scoped themes

Let's start with general theme styles,
before we get the list-link pattern specifically.
In the example, light mode is the global default theme,
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

My argument is not that specificity conflicts never occur across scope,
but that specificity & layers already provide appropriate solutions,
and we don't need scope to override them by default.
Instead scope adds the ability to:

- Avoid selectors escaping their context, through lower boundaries
- Ensure that similar-weight patterns respect proximity

In my mind,
the purpose of global scope is
_explicitly to apply everywhere_,
and the purpose of a narrower scope is
_to constrain where some styles apply_.
The argument for strong scope assumes that goal
(constraint) _always aligns_ with a desire
to write a "more specific" style,
that should override the global,
(even without a more specific selector).

I don't understand that assumption.

While there are _some cases_ where we want both,
we already have specificity tools, and layering for that.
But if we insist these goals always go together,
we end up making it very hard
in the cases where they don't.

