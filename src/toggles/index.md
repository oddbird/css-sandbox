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
