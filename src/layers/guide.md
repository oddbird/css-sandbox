---
title: Draft Outline for an (In)Complete Guide
created: 2022-01-14
changes:
  - time: 2022-01-21T17:02:21-07:00
    log: Begin to flesh out use-cases and browser support
  - time: 2022-01-26T15:32:20-07:00
    log: Reorganize outline, draft intro and first use-case
  - time: 2022-01-31T13:47:07-07:00
    log: Layers in the cascade, full syntax, and details on browser support
eleventyNavigation:
  key: guide
  title: Draft Outline for an (In)Complete Guide
  parent: layers
warn: false
note: |
  This is a work-in-progress draft document,
  working towards a more complete guide
  that can be published elsewhere.
---

## Introduction: what (and why) are cascade layers?

### Problem: specificity conflicts escalate

Many of us have been in situations
where we want to override styles
from elsewhere in our code
(or a third-party tool),
due to conflicting selectors.
And over the years,
authors have developed a number of
'methodologies' and 'best practices' to avoid these situations --
such as 'only using a single class' for all selectors.
These rules are usually more about avoiding the cascade,
rather than [putting it to use](https://css-tricks.com/dont-fight-the-cascade-control-it/).

Managing cascade conflicts and selector specificity
has often been considered one of the harder --
or at least more confusing --
aspects of CSS.
That may be partly because
few other languages
rely on a cascade as their central feature,
but it's also true that the original cascade
relies heavily on _heuristics_
(an educated-guess or assumption built into the code)
rather than providing direct & explicit control
to web authors.

_Selector specificity_, for example --
our primary interaction with the cascade --
is based on the assumption
that more narrowly targeted styles
(like IDs that are only used once)
are likely more important than more generic & reusable styles
(like classes and attributes).
That is to say: how _specific_ the selector is.
That's a good guess,
but it's not a totally reliable rule,
and that causes some issues:

- It combines the act of _selecting elements_,
  with the act of _prioritizing rule-sets_.
- The simplest way to 'fix' a conflict with specificity
  is to escalate the problem by adding
  otherwise unnecessary selectors,
  or (gasp) throwing the `!important` hand-grenade.

### Solution: cascade layers provide control

Cascade Layers give CSS authors
more direct control over the cascade,
so we can build more
intentionally cascading systems,
without relying as much on heuristic assumptions
that are tied to selection.

Using the `@layer` rule and layered `@import`s,
we can establish our own
_layers of the cascade_ --
building from low-priority styles
like resets and defaults,
through themes, frameworks, and design systems,
up to highest-priority styles like
components, utilities, and overrides.
Specificity is still applied to conflicts _within each layer_,
but conflicts between layers are always resolved
by using the higher-priority layer styles.

These layers are ordered and grouped,
so that they don't escalate
in the same way that specificity and importance can.
Cascade Layers aren't cumulative like selectors.
Adding more layers doesn't make something more important.
They're also not binary like importance --
suddenly jumping to the top of a stack --
or numbered like `z-index`,
where we have to guess a big number (`9999999`?).
In fact, by default,
layered styles are _less important_ than un-layered styles.

### Where do layers fit in the cascade?

The cascade is a series of steps (an algorithm)
for resolving conflicts between styles.

```css
html { --button: teal; }
button { background: rebeccapurple !important; }
.warning { background: maroon; }
```

```html
<button class='warning' style='background: var(--button);'>
  what color background?
</button>
```

With the addition of Cascade Layers,
those steps are:

1. Origin & Importance
2. Context (e.g. shadow-DOM vs light-DOM)
3. Element-Attached Styles (e.g. inline vs selectors)
4. **Cascade Layers**
5. Selector Specificity
   1. IDs
   2. Classes, Pseudo-Classes, and Attributes
   3. Elements & Pseudo-Elements
6. Order of Appearance

_Selector specificity_
is only one small part of the cascade,
but it's also the step we interact with most.
So that term is often used to refer more generally
to overall _cascade priority_.
People might say that the `!important` flag
or the `style` attribute 'adds specificity' --
a quick way of expressing that
the style becomes higher priority in the cascade.
Since Cascadce Layers
have been added directly above specificity,
it's reasonable to think about them
in a similar way:
one step more powerful than ID selectors.

However,
layers also make it more essential
that we fully understand the role of `!important`
in the cascade --
not just as a tool for 'increasing specificity,
but as a system for balancing concerns.

### Important origins, context, and layers are reversed!

==add example code to these sections?==

As web authors,
we often think of `!important`
as a way of increasing specificity,
to override inline styles or
highly specific selectors.
That works ok in most cases
(if you're ok with the escalation)
but it leaves out the primary purpose
of _importance_ as a feature
in the overall cascade.

Importance isn't there
to simply increase power --
but to balance the power
between various competing concerns.

#### Important origins

It all starts with _origins_,
where a style comes from in the web ecosystem.
There are three basic origins in CSS:

- The **browser** (or 'user agent')
- The **user** (often via browser 'preferences')
- Web **authors** (that's us!)

Browsers provide readable defaults for all the elements,
and then users set their preferences,
and then we (authors) provide the intended design
for our web pages.
So, by default,
browsers have the lowest priority,
user preferences override the browser defaults,
and we're able to override everyone.

But the creators of CSS were very clear
that we should not actually have the final word:

> If conflicts arise **the user should have the last word**,
> but one should also allow the author to attach style hints.
>
> -- Håkon Lie (emphasis added)

So _importance_ provides a way
for the browser and users
to re-claim their priority when it matters most.
When the `!important` flag is added to a style,
three new layers are created --
and the order is reversed!

1. `!important` browser styles (most powerful)
2. `!important` user preferences
3. `!important` author styles
4. 'normal' author styles
5. 'normal' user preferences
6. 'normal' browser styles (least powerful)

For us,
adding `!important` doesn't change much --
but for the browser and user
it's a very powerful tool for regaining control.

#### Important context

The same basic logic
is applied to _context_ in the cascade.
By default,
styles from the host document (light DOM)
override styles from an embedded context (shadow DOM).
However, adding `!important` reverses the order:

1. `!important` shadow context (most powerful)
2. `!important` host context
3. 'normal' host context
4. 'normal' shadow context (least powerful)

Important styles
that come from inside a shadow context
override important styles
defined by the host document.

#### Important layers

Layers work the same way
as both origins and context,
with the important layers
in reverse-order.
The only difference is
that layers will make that behavior
much more noticeable.

Once we start using cascade layers,
we will need to be
much more cautious and intentional
about how we use `!important`.
It's no longer a quick way
to jump to the top of the priorities --
but an integrated part of
our cascade layering.
A way for lower layers to _insist_
that some of their styles are essential.

Since layers are customizable,
there's no pre-defined order.
But we can imagine starting with three layers:

1. utilities (most powerful)
2. components
3. defaults (least powerful)

When styles in those layers
are marked as important,
they would generate three new,
reversed important layers:

1. `!important` defaults (most powerful)
2. `!important` components
3. `!important` utilities
4. 'normal' utilities
5. 'normal' components
6. 'normal' defaults (least powerful)

### Establishing a layer order

We can create any number of layers,
and name them or group them in various ways.
But the most important thing to do
is make sure our layers are applied
in the right order of priority.

While a single layer
can be used multiple times
throughout the code base --
layers stack in the order they _first appear_.
The first layer is at the bottom (least powerful),
and the last layer at the top (most powerful).
But then, above that,
**un-layered styles have the highest priority**:

1. un-layered styles (most powerful)
2. layer-3
3. layer-2
4. layer-1 (least powerful)

Then, as discussed above,
any important styles
are applied in a reverse order:

1. `!important` layer-1 (least powerful)
2. `!important` layer-2
3. `!important` layer-3
4. `!important` un-layered styles (most powerful)
5. 'normal' un-layered styles (most powerful)
6. 'normal' layer-3
7. 'normal' layer-2
8. 'normal' layer-1 (least powerful)

Layers can also be grouped --
allowing us to do more complicated sorting
of top-level and nested layers:

1. un-layered styles (most powerful)
2. layer-3
   1. layer-3 un-nested
   2. layer-3 sublayer-2
   3. layer-3 sublayer-1
3. layer-2
4. layer-1 (least powerful)

This makes it possible for the authors of a site
to have final say over the layer order.
By providing a layer order up-front,
before any third party code is imported,
the order can be established and rearranged in one place,
without worrying about
how layers are used in any third-party tool.

## Syntax: working with cascade layers

Let's take a look at the syntax!

### Order-setting `@layer` statements

Since layers are stacked
in the order they are defined,
it's important that we have a tool
for establishing that order
all in one place!

We can use `@layer` statements to do that.
The syntax is:

```css
@layer <layer-name>#;
```

That `#` means
we can add as many layer names as we want,
in a comma-separated list:

```css
@layer reset, defaults, framework, components, utilities;
```

That will establish the layer order:

1. un-layered styles (most powerful)
2. utilities
3. components
4. framework
5. defaults
6. reset (least powerful)

We can do this as many times as we want,
but remember:
what matters is the order each name _first appears_.
So this will have the same result

```css
@layer reset, defaults, framework;
@layer components, defaults, framework, reset, utilities;
```

The ordering logic
will ignore the order of
`reset`, `defaults`, and `framework`
in the second `@layer` rule
because those layers have already been established.

These layer-ordering statements
are allowed at the top of a stylesheet,
before the `@import` rule
(but not between imports).
We highly recommend using this feature
to establish all your layers up-font
in a single place --
so you always know where to look
or make changes.

### Block `@layer` rules

The block version of the `@layer` rule
only takes a single layer name,
but then allows you to add styles to that layer:

```css
@layer <layer-name> {
  /* styles added to the layer */
}
```

You can put most things inside an `@layer` block --
media-queries, selectors and styles,
support queries, etc.
The only things you can't put inside a layer block
are things like charset, imports, and namespaces.
But don't worry,
there is a syntax for importing styles into a layer.

If the layer name hasn't been established before,
this layer rule will add it to the layer order.
But if the name has been established,
this allows you to add styles to existing layers
from anywhere in the document --
without changing the priority of each layer.

If we've established our layer-order up-front
with the layer statement rule,
we no longer need to worry
about the order of these layer blocks:

```css
/* establish the order up front */
@layer defaults, components, utilities;

/* add styles to layers in any order */
@layer utilities {
  [hidden] { display: none; }
}

/* utilities will override defaults, based on established order */
@layer defaults {
  * { box-sizing: border-box; }
  img { display: block; }
}
```

### Grouping (nested) layers

Layers can be grouped,
by nesting layer rules:

```css
@layer one {
  /* sorting the sub-layers */
  @layer two, three;

  /* styles ... */
  @layer three { /* styles ... */ }
  @layer two { /* styles ... */ }
}
```

This generates grouped layers
that can be represented by joining
the parent and child names with a period.
That means the resulting sublayers
can also be accessed directly from outside the group:

```css
/* sorting nested layers directly */
@layer one.two, one.three;

/* adding to nested layers directly */
@layer one.three { /* ... */ }
@layer one.two { /* ... */ }
```

The rules of layer-ordering apply
at each level of nesting.
Any styles that are not further nested
are considered 'un-layered' in that context,
and have priority over
further nested styles:

```css
@layer defaults {
  /* un-layered defaults (higher priority) */
  :any-link { color: rebeccapurple; }

  /* layered defaults (lower priority) */
  @layer reset {
    a[href] { color: blue; }
  }
}
```

Grouped layers are also contained
within their parent,
so that the layer order does not intermix across groups.
In this example,
the top level layers are sorted first,
and then the layers are sorted
within each group:

```css
@layer reset.type, default.type, reset.media, default.media;
```

Resulting in a layer order of:

1. _un-layered_ (most powerful)
2. default group
  1. default _un-layered_
  2. default.media
  3. default.type
3. reset group
  4. reset _un-layered_
  5. reset.media
  6. reset.type

Note that layer names are also scoped
so that they don't interact or conflict
with similarly-named layers outside their nested context.
Both groups can have distinct `media` sub-layers.

This grouping becomes especially important
when using `@import` or `<link>`
to layer entire stylesheets.
A third-party tool like bootstrap
could use layers internally --
but we can nest those layers into a shared
`bootstrap` layer-group on import,
to avoid potential layer-naming conflicts.

### Layering entire stylesheets with `@import` or `<link>`

Entire stylesheets
can be added to a layer
using the new `layer()` function syntax
with `@import` rules:

```css
/* styles imported into to the <layer-name> layer */
@import url('example.css') layer(<layer-name>);
```

There is also a proposal
to add a `layer` attribute
in the html `<link>` element --
although this is still under development,
and [not yet supported anywhere](#assigning-layers-in-html-with-the-link-tag).

This can be used
to import third-party tools
or component libraries,
while grouping any internal layers together
under a single layer name --
or as a way of organizing layers
into distinct files.

### Anonymous (un-named) layers

Layer names are helpful --
they allow you to access the same layer
from multiple places,
for sorting or combining layer blocks --
but they are not required.

It's possible to create _anonymous_
(un-named) layers using the block layer rule:

```css
@layer { /* ... */ }
@layer { /* ... */ }
```

Or using the import syntax,
with a `layer` keyword
in place of the `layer()` function:

```css
/* styles imported into to a new anonymous layer */
@import url('../example.css') layer;
```

Each anonymous layer is unique,
and added to the layer order
where it is encountered.
Anonymous layers can't be referenced
from other layer rules,
for sorting or appending more styles.

These should probably be used sparingly,
but there might be a few use-cases:

- Projects could ensure that all styles for a given layer
  are required to be located in a single place.
- Third-party tools could 'hide' their internal layering
  inside anonymous layers,
  so that they don't become part of the tool's public API.

### Reverting values to the previous layer

#### Context: existing global cascade keywords

CSS has several
'[global keywords](https://developer.mozilla.org/en-US/docs/Web/CSS/all#values)'
which can be used on any property
to help roll-back the cascade in various ways.
Those previously included:

- `initial`
  sets a property to the _specified_ value
  before any styles (including browser defaults) are applied.
  This can be surprising
  as we often think of browser styles
  as the initial value --
  but (for example) the `initial` value of `display` is `inline`,
  no matter what element we use it on.
- `inherit`
  sets the property to inherit a value
  from its parent element.
  This is the default for inherited properties,
  but can still be used to remove a previous value.
- `unset`
  acts as though simply removing all previous values --
  so that inherited properties once again `inherit`,
  while non-inherited properties
  return to their `initial` value.
- `revert`
  Only removes values that we've applied
  in the author origin (the site styles).
  This is what we want in most cases,
  since it allows the browser and user styles
  to remain intact.

#### New: the `revert-layer` keyword

Cascade Layers add a new global `revert-layer` keyword.
It works the same as `revert`,
but only removes values
that we've applied
in the current cascade layer.
We can use that to roll back the cascade,
and use whatever value was
defined in the previous layers.

In this example,
the `no-theme` class
removes any values set in the `theme` layer.


```css
@layer default {
  a { color: maroon; }
}

@layer theme {
  a { color: var(--brand-primary, purple); }

  .no-theme {
    color: revert-layer;
  }
}
```

So a link tag with the `no-theme` class
will roll back to use the value set
in the `default` layer.

When `revert-layer` is used in un-layered styles
it behaves the same as `revert` --
rolling back to the previous origin.

#### Reverting important layers

Things get interesting
if we add `!important` to the `revert-layer` keyword.
Because each layer has two distinct
'normal' and 'important'
[positions in the cascade](#important-layers),
this doesn't simply
change the priority of the declaration --
it changes what layers are reverted.

Let's assume we have three layers defined,
in a layer stack that looks like:

1. utilities (most powerful)
2. components
3. defaults (least powerful)

We can flesh that out to include
not just normal and important
positions of each layer,
but also un-layered styles,
and animations:

1. `!important` defaults (most powerful)
2. `!important` components
3. `!important` utilities
4. `!important` un-layered styles
5. CSS animations
6. 'normal' un-layered styles
7. 'normal' utilities
8. 'normal' components
9. 'normal' defaults (least powerful)

Now, when we use `revert-layer`
in a normal layer (let's use `utilities`)
the result is fairly direct.
We revert _only that layer_,
while everything else applies normally:

1. ✅ `!important` defaults (most powerful)
2. ✅ `!important` components
3. ✅ `!important` utilities
4. ✅ `!important` un-layered styles
5. ✅ CSS animations
6. ✅ 'normal' un-layered styles
7. ❌ 'normal' utilities
8.  ✅ 'normal' components
9.  ✅ 'normal' defaults (least powerful)

But when we move that `revert-layer`
into the important position,
we revert both the normal and important versions
_along with everything in-between_:

1. ✅ `!important` defaults (most powerful)
2. ✅ `!important` components
3. ❌ `!important` utilities
4. ❌ `!important` un-layered styles
5. ❌ CSS animations
6. ❌ 'normal' un-layered styles
7. ❌ 'normal' utilities
8. ✅ 'normal' components
9. ✅ 'normal' defaults (least powerful)

## Use cases: when would I want to use cascade layers?

### Less intrusive resets and defaults

One of the clearest initial use-cases
would be to make low-priority defaults
that are easy to override.

Some resets have been doing this already
by applying the `:when()` pseudo-class
around each selector.
That removes all specificity from the selectors,
which has the basic impact desired,
but also some downsides:

- It has to be applied to each selector individually
- Conflicts inside the reset have to be resolved without specificity

Layers allow us to more simply wrap
the entire reset stylesheet,
either using the block `@layer` rule:

```css
/* reset.css */
@layer reset {
  /* all reset styles in here */
}
```

Or when you import the reset:

```css
/* reset.css */
@import url(reset.css) layer(reset);
```

**Note**: Or both!
Layers can be nested,
without changing their priority --
so you can use a third-party reset,
and ensure it gets added to the layer you want
whether or not the reset stylesheet itself
is written using layers internally.

Since layered styles have a lower priority
than default 'un-layered' styles,
this is a good way to start using Cascade Layers
without re-writing your entire code-base.

The reset selectors still have specificity information
to help resolve internal conflicts,
without wrapping each individual selector --
but you also get the desired outcome
of a reset stylesheet that is easy to override.

### Using third-party tools and frameworks

Integrating third-party CSS with a project
is one of the most common places
to run into cascade issues.
Whether we're using a shared reset like Normalizer or CSS Remedy,
a generic design system like Material Design,
a framework like Bootstrap,
or a utility toolkit like Tailwind --
we can't always control the selector specificity
or importance
of all the CSS being used on our sites.
Sometimes this even extends to
internal libraries, design systems, and tools
managed elsewhere in an organization.

As a result,
we often have to structure our internal CSS
around the third-party code,
or escalate conflicts when they come up --
with artificially high specificity
or `!important` flags.
And then we have to maintain those hacks over time,
adapting to upstream changes.

Cascade Layers give us a way to
slot third-party code into the cascade of any project
exactly where we want it to live --
no matter how selectors are written internally.

Depending on the type of library we're using,
we might do that in various ways.
Let's start with a basic layer-stack,
working our way up from resets to utilities:

```css
@layer reset, type, theme, components, utilities;
```

And then we can incorporate some tools...

#### Using a reset

If we're using a tool like CSS Remedy,
we might also have some reset styles of our own
that we want to include.
Let's import CSS Remedy into a sub-layer of `reset`:


```css
@import url('remedy.css') layer(reset.remedy);
```

Now we can add our own reset styles
to the `reset` layer,
without any further nesting (unless we want it).
Since styles directly in `reset`
will override any further nested styles,
we can be sure our styles will always take priority
over CSS Remedy if there's a conflict --
no matter what changes in a new release:

```css
@import url('remedy.css') layer(reset.remedy);

@layer reset {
  :is(ol, ul)[role='list'] {
    list-style: none;
    padding-inline-start: 0;
  }
}
```

And since the `reset` layer
is at the bottom of the stack,
the rest of the CSS in our system
will override both Remedy,
and our own local reset additions.

### Using utility classes

At the other end of our stack,
'utility classes' in CSS can be a useful way
to reproduce common patterns
(like additional context for screen-reader)
in a broadly-applicable way.
Utilities tend to break the specificity heuristic,
since we want them defined broadly
(resulting in a low specificity),
but we also generally want them to 'win' conflicts.

By having a `utilities` layer
at the top of our layer stack,
we can make that possible.
We can use that in a similar way
to the reset example,
both loading external utilities into a sub-layer,
and providing our own:

```css
@import url('tailwind.css') layer(utilities.tailwind);

@layer utilities {
  /* from https://kittygiraudel.com/snippets/sr-only-class/ */
  /* but with !important removed from the properties */
  .sr-only {
    border: 0;
    clip: rect(1px, 1px, 1px, 1px);
    -webkit-clip-path: inset(50%);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    margin: -1px;
    padding: 0;
    position: absolute;
    width: 1px;
    white-space: nowrap;
  }
}
```

### Using design systems and component libraries

There are a lot of CSS tools
that fall somewhere in the middle of our layer stack --
combining typography defaults, themes, components,
and other aspects of a system.

Depending on the particular tool,
we might do something similar to
the reset and utility examples above --
but there are a few other options.
A highly integrated tool
might deserve in a top-level layer:

```css
@layer reset, bootstrap, utilities;
@import url('bootstrap.css') layer(bootstrap);
```

If these tools start to
provide layers as part of their public API,
we could also break it down into parts --
allowing us to intersperse
our code with the library:

```css
@import url('bootstrap/reset.css') layer(reset.bootstrap);
@import url('bootstrap/theme.css') layer(theme.bootstrap);
@import url('bootstrap/components.css') layer(components.bootstrap);

@layer theme.local {
  /* styles here will override theme.bootstrap */
  /* but not interfere with styles from components.bootstrap */
}
```

### Managing a complex CSS architecture (across projects & teams?)

==todo==

Implement a system like ITCSS
at scale,
using native browser features.

### Designing a CSS tool or framework

==todo==

Frameworks can choose to expose or hide
layers as part of their API

### ❓ I just want this one property to be more `!important`

==todo==

It depends,
but maybe that's the job of
`!important`?

### ❌ Scoping and name-spacing styles? Nope!

==todo==

[Recent twitter post](https://twitter.com/TerribleMia/status/1483171004235059202)

## Examples: which style wins?

==todo==

Give various examples,
and show which style wins in each situation.

## Debugging layer conflicts in browser developer tools

==todo==

We'll have to see what this looks like
in various browsers...

## Browser support and fallbacks

Cascade layers are (or will soon be) available by default
in all the three major browser engines:

- Chrome/Edge 99+
- Firefox 97+
- Safari (currently in the Technology Preview)

<p class="ciu_embed" data-feature="css-cascade-layers" data-periods="future_1,current,past_1,past_2" data-accessible-colours="false">
  <picture>
    <source type="image/webp" srcset="https://caniuse.bitsofco.de/image/once-event-listener.webp">
    <source type="image/png" srcset="https://caniuse.bitsofco.de/image/once-event-listener.png">
    <img src="https://caniuse.bitsofco.de/image/once-event-listener.jpg" alt="Data on support for the once-event-listener feature across the major browsers from caniuse.com">
  </picture>
</p>
<script src="https://cdn.jsdelivr.net/gh/ireade/caniuse-embed/public/caniuse-embed.min.js"></script>

Since layers are intended as foundational building blocks
of an entire CSS architecture,
it is difficult to imagine building manual fallbacks
in the same way you might for other CSS features.
The fallbacks would likely involve
duplicating large sections of code,
with different selectors to manage cascade layering --
or providing a much simpler
fallback stylesheet.

### Query feature support using `@supports`

There is a new `@supports` feature in CSS
that will allow authors to test for support of `@layer`
and other at-rules:

```css
@supports at-rule(@layer) {
  /* code applied for browsers with layer support */
}

@supports not at-rule(@layer) {
  /* fallback applied for browsers without layer support */
}
```

However,
it's also not clear
when this query itself will be supported in browsers.

### Assigning layers in HTML with the `<link>` tag

There is no official specification yet
for a syntax to layer entire stylesheets
from the html `<link>` tag --
but these is a [proposal being developed](https://github.com/whatwg/html/issues/7540).
That proposal includes a new `layer` attribute
which can be used to assign the styles
to a named or anonymous layer:

```html
<!-- styles imported into to the <layer-name> layer -->
<link rel="stylesheet" href="example.css" layer="<layer-name>">

<!-- styles imported into to a new anonymous layer -->
<link rel="stylesheet" href="example.css" layer>
```

However,
old browsers
without support for the `layer` attribute
will ignore it completely,
and continue to load the stylesheet
without any layering.
The results could be pretty unexpected.
So the proposal also extends
the existing `media` attribute,
so that it allows feature support queries
in a `support()` function.

That would allow us to make layered links conditional,
based on support for layering:

```html
<link rel="stylesheet" layer="bootstrap" media="supports(at-rule(@layer))" href="bootstrap.css">
```

### Potential polyfills & workarounds

The major browsers have all moved to an 'evergreen' model
with updates pushed to users
on a fairly short release cycle.
Even Safari regularly releases new features
in 'patch' updates
between their more rare-seeming
major versions.

That means we can expect browser support
for these features to ramp up very quickly.
For any of us,
it may be reasonable to start using layers
in only a few months,
without much concern for old browsers.

For others,
it may take longer
to feel comfortable with the native browser support.
There are many other ways to
[manage the cascade](https://css-tricks.com/dont-fight-the-cascade-control-it/),
using selectors,
[custom properties](https://css-tricks.com/using-custom-property-stacks-to-tame-the-cascade/),
and other tools.

It's also theoretically possible
to mimic (or polyfill) the basic behavior.
There are people working on that polyfill,
but it's not clear when that will be ready either.

## More resources

### Reference

- [Cascading & Inheritance Level 5 Specification](https://www.w3.org/TR/css-cascade-5/#layering)
- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

### Articles

- [The Future of CSS: Cascade Layers (CSS @layer)](https://www.bram.us/2021/09/15/the-future-of-css-cascade-layers-css-at-layer/)
  by **Bramus Van Damme**
- [Getting Started With CSS Cascade Layers](https://www.smashingmagazine.com/2022/01/introduction-css-cascade-layers/)
  by **Stephanie Eckles**, _Smashing Magazine_
- [Cascade layers are coming to your browser](https://developer.chrome.com/blog/cascade-layers/)
  by **Una Kravets**, _Chrome Developers_

### Videos

- [How does CSS !important actually work?](https://youtu.be/dS123IXPcJ0)
  by **Una Kravets**
- [An overview of the new @layer and layer() CSS primitives](https://youtu.be/ilrPpSQJb3U)
  by **Una Kravets**

### Demos

- [Layers CodePen collection](https://codepen.io/collection/BNjmma)
