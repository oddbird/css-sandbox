---
title: Declarative Toggles
eleventyNavigation:
  key: toggles
  title: Declarative Toggles
  parent: home
---

There are many use-cases
that require "toggling" the state of one element
by clicking on a different element.
Many of these could be described
in terms of _show/hide_ states specifically:

- tabs
- accordions
- popups
- dialogs
- summary/details

The OpenUI project
has been working on new elements
that could help with those use-cases
at a high level --
which I'll try to track here.

But I'm also interested in
low-level tools to address more generic
"toggle" behavior

## Resources

- CSS toggle states
  [draft spec](http://tabatkins.github.io/specs/css-toggle-states/)
- Declarative show/hide
  [github repo](https://github.com/flackr/declarative-show-hide) &
  [google doc](https://docs.google.com/document/d/1HcQ75iRhO-dT7EHB6JrjmMATa9XlSCYZKWrXbzakexQ/edit?resourcekey=0-kYHpL3r3jY3Q8wtTaOa6aA#)
- Spicy section custom element
  [demo site](https://spicy-sections.glitch.me/)

## Toggle States

The goal is that we can describe an element as having toggle states,
which can be "shared by" or "forwarded to" other elements --
similar (but not identical) to the way `label`s
share state with their related input.

One of the difficult goals for making this CSS-centered,
is to ensure we don't require hard-coded links
(especially unique-IDs)
for making the connection between a toggle-trigger,
and any toggle-targets.

In my mind,
the ideal would be to give each toggle a `custom-ident`,
which triggers can update,
and targets can subscribe to.

### Counter-like proposal

That's the approach
that Tab and I have taken in our
initial [syntax exploration][hackmd].
The key feature here is that named toggles
work in the same way as CSS counters:

- They flow to consecutive siblings,
  and also inherit to descendants
- They can be updated or reset in either flow,
  creating toggle scopes

[hackmd]: https://hackmd.io/@aZMW07qbQcuCFmPlAAwUNA/r1yUEgitd

### Non-exclusive toggles:

- `toggle-states`: A custom-identifier for the toggle
  (this may deserves a separate longhand like `toggle-name`?),
  the number of states that a toggle has (default `2`),
  and possibly custom-ident names for those states?
- `toggle-set`: A toggle custom-ident.
  This establishes an element in the toggle scope
  as an interaction-target,
  that increments the given toggle when activated.
- `toggle`: Shorthand for naming and setting a toggle in a single element.

```html
<accordion>
  <tab>...</tab>
  <content>...</content>
  <tab>...</tab>
  <content>...</content>
  <tab>...</tab>
  <content>...</content>
</accordion>
```

```css
/* establish the toggle & interaction */
tab {
  toggle: --card 2;
}

/* active styles */
tab:checked(--card) { … }
content:checked(--card) { … }
```

### Exclusive toggle groups

- `toggle-group`: The same syntax as `toggle-states`,
  but generates a group of name-sharing exclusive sub-toggles
  (much like radio button groups).
- `toggle-item`: Defines a unique item in a shared `toggle-group`,
  and allows it to be set.

Using the same HTML structure as above...

```css
tabs {
 toggle-group: --tabs hide show;
}

tab {
 toggle-item: --tabs;
}

/* active styles */
tab:checked(--tabs) { … }
content:checked(--tabs) { … }
```

### Default toggle-states

Default states will need to be established by the HTML,
using a new attribute that accepts the toggle-name,
and the state.

```html
<article toggled="--colors dark">
```

By default:

- elements with no toggled attribute
  are in the first (unchecked) state
- elements with the attribute, but no specified state,
  are put in the second (checked) state

This behavior (and naming?)
should also match the provided pseudo-class:

```css
article { … } /* initial state */
article:toggled(--colors) { … } /* first checked state */
article:toggled(--colors dark) { … } /* explicit state */
```

### Open Questions & Potential Issues

- All syntax needs bikeshedding...
  - clarity around toggle-names, state-counts, and state-names
  - is `:checked()` the right syntax for a pseudo?
  - what are the default states, and can we name them (e.g. on/off)?
- Can a11y be built-in and handled automagically?
  - different toggle types (show/hide, files, etc) may need different a11y handling,
  - ways to opt-into those semantics?
  - **it should not be easy to create in-accessible interfaces**
- How do we handle content-visibility?
  - Especially for linking into hidden tabs, etc?
- How does it interact with animations & transitions?
- Can state be maintained across navigation, like form controls?

This work will
be brought to CSSWG for initial feedback,
with continued development in OpenUI
before it becomes a specification.

## New elements

We also hope to provide higher level controls,
based around a new HTML element or elements.
That work is also happening in the OpenUI CG.

- Research PR: https://github.com/openui/open-ui/pull/350

### Spicy Sections

Based on that research,
and some discussion of
"[Design Affordance Control](https://bkardell.com/blog/DesignAffordanceControls.html)" --
Brian Kardell built a web component
[`spicy-section`](https://spicy-sections.glitch.me/just-demos.html).

In a native implementation,
we could imagine improving the syntax,
but this gives us an opportunity
to explore the approach.
Specific names always need to go through
a process of bike-shedding.

The element itself doesn't do anything
until you add an `affordance` to it.
Most directly, you can do that with an HTML attribute:

```html
<spicy-section affordance="tab-bar">
  ...
</spicy-section>
```

In HTML, an `affordance`-like attribute makes sense
for changing which collapse/tab/normal affordances we see.
But when we port that to CSS --
an `affordance` property --
it feels strange.

The current demo uses a property
with inline media-queries:

```css
spicy-section {
  --const-mq-affordances:
    [screen and (max-width: 40em) ] collapse |
    [screen and (min-width: 60em) ] tab-bar
  ;
}
```

We could break that out into:

```css
@media screen and (max-width: 40em) {
  spicy-section { affordance: collapse; }
}

@media screen and (min-width: 60em) {
  spicy-section { affordance: tab-bar; }
}
```

That looks pretty good to me...
Except that,
as far as I know,
we don't have a lot of properties
that only apply to one single element type.
Maybe if we count `content` on generated elements?

That makes me wonder
if we've designed a lower-level concept
which could be applied to existing
block sectioning elements --
`div`, `section`, `main`, `article`, etc.
Why not allow the new attribute & property
on any of them?

This is still higher-level
than the totally generic
CSS Toggles described above.
In addition to setting up toggles for you,
it provides show/hide functionality,
the ability to generate a tab bar, etc.

But it seems like
that is mostly be handled
through an attribute & property.
The goal of a new element
would be to set a specific affordance
out-of-the-box,
and we're not really doing that.
The element is only acting as a target
for the new attribute & CSS property --
which apply all the affordances.

So we could also imagine
that any new element would instead
provide a specific preset affordance?
Something like a `<tabs>` or `<accordion>` element,
that defaults to a specific affordance?
Is that useful?
Do people ever want
the same affordance at all screen sizes?
