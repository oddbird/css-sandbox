---
title: CSS Toggles Explainer & Proposal
created: 2022-02-28
changes:
  - time: 2022-03-01T18:41:51-07:00
    log: Flesh out syntax and initial examples
  - time: 2022-03-02T11:44:12-07:00
    log: Clarify toggle-root syntax, and document additional questions
  - time: 2022-03-02T13:59:04-07:00
    log: Additional examples and questions to consider
  - time: 2022-03-02T16:36:16-07:00
    log: Document the basic issues with carousel/scrolling
  - time: 2022-03-09T11:46:28-07:00
    log: Clarify presentational restriction in non-goals
  - time: 2022-03-11T15:53:53-07:00
    log: Document potential missing features
  - time: 2022-03-16T15:22:03-06:00
    log: Propose syntax improvements around named states, & dynamic transitions
  - time: 2022-04-11T15:41:59-06:00
    log: Links to js polyfill & demo
eleventyNavigation:
  key: toggles-explainer
  title: CSS Toggles Explainer
  parent: toggles
warn: |
  This explainer is still under active development.
---

## Authors

- Miriam Suzanne
- Tab Atkins Jr.

See the [References & Acknowledgements](#references--acknowledgements)
for additional contributors and prior art

## Participate

- [Unofficial draft specification][spec]
- [Github issues for draft spec][issues]
- [CSSWG tracking issue](https://github.com/w3c/csswg-drafts/issues/6991)
- [OddBird JS polyfill/prototype][polyfill]
  (and [demo][])

[spec]: https://tabatkins.github.io/css-toggle/
[issues]: https://github.com/tabatkins/css-toggle
[polyfill]: https://github.com/oddbird/css-toggles
[demo]: https://toggles.oddbird.net/

## Introduction

There are many use-cases
where an interaction (click/gesture) on one element
toggles a 'state' that can be shared with other elements.
This can range from toggling light/dark mode,
to activating slide-in navigation,
opening and closing menus,
or interacting with sectioned content
as tabs, accordions, or carousels.
HTML also provides the `<input type=checkbox>` element,
with a "checked" state that toggles between `true` and `false`
when the user activates the element,
and which can be selected by the `:checked` pseudoclass.

These cases currently require custom Javascript,
which adds a barrier for authors otherwise capable
of implementing the visual design --
and often results in less performant,
less accessible solutions.

We propose generalizing the pattern
so that it can be applied to any element
using a declarative syntax in CSS,
with built-in accessibility and performance.

## Goals [or Motivating Use Cases, or Scenarios]

To borrow language from Nicole Sullivan:

> a _gesture_
> on a _trigger_
> causes a _state change_
> on a _target_

Where:

- a _gesture_ is usually some form of user interaction,
  like click/enter activation, scrolling, etc.
  It may also be useful to consider non-user 'gestures'
  such as animation events that trigger a toggle state.
- a _trigger_ and a _target_ are both elements in the DOM
  (often different elements, but sometimes the same element)
- a _state change_ can be moving through a list of possible states,
  or setting a particular state

Several of the expected use-cases
involve showing and hiding content
based on the state of a toggle:

- tabs
- accordions / tree views
- carousels
- popups
- dialogs
- summary/details
- off-canvas menus

However, there are also use-cases
for a toggle to have more complex style impact:

- light/dark/high-contrast/auto color themes
- adjusting font sizes
- adjusting compact/comfortable spacing
- adjusting 'views', eg calendar/agenda or horizontal/vertical layout

The [Open UI](https://open-ui.org/) project
has been working on new elements/attributes
that could help with some of these use-cases
at a high level --
such as panel sets ('spicy sections'),
selectmenus, and popups.
It's our goal that CSS toggles provide
some shared functionality
that those elements & attributes can rely on,
while also giving authors access
to define new toggle-based patterns.

Along the way,
we have a few goals for
_how this feature should work_:

- Accessibility should be baked in by default,
  rather than relying on author intervention
- Relationships between a trigger and its impact
  should be established and accessed in CSS,
  rather than relying on unique IDs or selectors-as-property-values.
- JS should not be required in the most common use-cases
- Defaults should help facilitate the most common use-cases,
  while still allowing more complex state interactions.

## Non-goals

### Managing application state

While there is a much larger need
for improved application state management on the web,
this proposal is focused specifically on the needs of CSS.
That line is not necessarily clean and simple to define --
but we think that:

- State changes which need to update the DOM,
  or be 'saved' into app state
  should be primarily handled outside CSS.
  Those are not presentation-specific concerns.
- It should still be possible to use this feature
  in tandem with other web languages
  to represent/display those more complex application states in CSS.

For example, interacting with a 'tab' or 'accordion' design pattern
is a purely presentational concern that requires some state management.
However, changing the 'status' of a user/page
from 'logged out' to 'logged-in' --
or deleting an item from a list --
are broader application states
that may only be 'reflected' in the presentation.

The boundaries are complicated,
since it may be useful for eg:

- Activating a `save` button changes a toggle state to `saving`
- The styles are able to reflect that state change immediately
- JS can listen for either the button activation, or the state change,
  in order to trigger a network request and/or change app state internally
- JS can then trigger a change in the CSS toggle state
  when the internal app data updates are complete

That means we need both:

- a CSS syntax that allows for handling the presentational needs
- an API allowing other web languages to read & set CSS states when necessary

### Potential name confusion

The term 'toggle' has been used in reference to
various different features over the years.

[CSS Values & Units level 5](https://drafts.csswg.org/css-values-5/#funcdef-toggle)
defines an (unimplemented) `toggle()` function that allows
cycling through a set of values as elements are nested.
For example, toggling between `italic`/`normal`
or cycling through different list markers:

```css
em { font-style: toggle(italic; normal); }
ul { list-style-type: toggle(disc; circle; square; box); }
```

This proposal is unrelated to that CSS function.
(We might want to bikeshed the naming of one or the other).
[David Baron has proposed][cycle] `cycle()`
as an alternative name for the `toggle()` function.

[cycle]: https://lists.w3.org/Archives/Public/www-style/1999May/0067

The word is also sometimes used
in reference to '[switch](https://open-ui.org/components/switch)' components.
While this proposal has some overlap with a switch --
it could be used to generate the switch behavior --
we are not attempting to define a new element here.

It's also possible that the term 'toggle' could cause confusion,
as many might expect it to have a boolean (on/off) behavior.
The current proposal, however,
allows for any number of desired states.

## Proposal for declarative CSS toggles

### Broad overview

This proposal relies on several primary concepts.
First off the toggles themselves:

- Every **toggle** has a name, a current state,
  set number of possible states,
  and some metadata for determining
  how to move between states _by default_.
- Any element can become a **toggle root**
  for any number of toggles,
  using the `toggle-root` property.

Once we have toggles,
we need a way to access them --
both for the sake of _changing_ state,
and also in order to _use_ that state somehow.
Every toggle has a **toggle scope**
of elements that are able to 'see' or alter its state.
That scope includes the toggle-root element
and any descendants (similar to inheritance),
as well as (optionally) siblings and the descendants of siblings
(similar to the css counters).

Any element that can 'see' and access a given toggle:

- Can become a **trigger** for that toggle
  using the `toggle-trigger` property,
  such that interactions on the trigger element
  update the state of the toggle.
- Can use the `:toggle()` pseudo-class
  to select based on the current state of the toggle

It's important for authors to understand
the distinctions between these things:

- The _toggle root element_, where a toggle is 'hosted'
- The _toggle scope_, where a toggle is 'visible'
- Any number of _toggle trigger elements_,
  which can update the toggle state when activated

### Establishing toggles (`toggle-root`)

The `toggle-root` property
generates new toggles on a given element,
and controls how those toggles behave.
The overall syntax allows either `none`,
or a comma-separated list of toggle definitions.

A simple auto/light/dark color-mode toggle
might be defined on the document root:

```css
:root {
  /* color-mode toggle with 2 active states */
  toggle-root: color-mode 2;
}
```

{% warn %}
We could consider adding longhand properties
for the various parts of the toggle description,
and make `toggle-root` into a shorthand.
But that's not a simple request for implementors,
since it would involve
collating multiple list-valued properties.
{% endwarn %}

#### Toggle names

Each toggle definition begins with
a (required) **toggle name** --
an identifier that allows us to access this particular toggle.

#### Toggle states

After the name, we can optionally define
the initial and maximum states.
States are (currently) represented as integers,
where `0` is considered 'inactive'
and there can be any number of 'active' states
represented by positive integers:

- The **maximum state** (`[1,∞]`) defaults to `1` (a binary toggle),
  and represents the number of possible active states.
- The **initial state** (`[0,<maximum>]`) defaults to `0` (inactive),
  and can be any number less than or equal to the maximum.

If a single integer is given,
that sets the maximum state.
To set both the initial and maximum,
we can use two `/`-divided integers in the form
`<initial-state>/<maximum-state>`.

```css
:root {
  /* 2 active states (initially inactive) */
  toggle-root: color-mode 2;
  /* same result as above */
  toggle-root: color-mode 0/2;
}

.my-toggle {
  /* 4 active states (initially in 2nd active state) */
  toggle-root: my-toggle 2/4;
}
```

{% warn 'ToDo' %}
Consider using a keyword,
rather than a slash for the divider?
Similar to the keywords in new color syntax
and gradient functions,
writing `my-toggle 1 of 4`
or `my-toggle 4 at 1` (max first)
might provide more clarity
about the relationship between these numbers.
{% endwarn %}

{% warn %}
The following examples are not yet supported
by the draft specification.
{% endwarn %}

We plan to also allow for a list of 'named states'
which would provide more clarity around the purpose of a state
beyond simple numbering.
This syntax still needs some attention,
but will likely require a wrapping function
or brackets.
This is still unspecified,
but I imagine something like this could work
(setting multiple toggles to show variants):

```css
html {
  toggle-root:
    colors [auto light dark] at light,
    middle-out 10 at 5,
    switch /* `1 at 0` is the default */
  ;
}
```

Personally,
I like brackets as a parallel
to the existing syntax
for named grid lines.

{% note %}
The [Toggles Polyfill][polyfill] currently supports:
- the specified `initial/max` syntax
- the keyword `max at initial` syntax
- the bracket/keyword `[one two three] at three` named-state syntax

[polyfill]: https://github.com/oddbird/css-toggles
{% endnote %}

#### Default toggle actions

While it's possible to define
more complex actions to move
from one specific state to another --
as you might in more complex state machines --
many of the known use-cases
can be handled with simple
increment/decrement actions.

To facilitate these simpler use-cases,
every toggle has a pre-defined flow
when activated by a generic trigger.
This is set with one of several keywords:

- (default): when no keyword is provided,
  the state will increment until reaching the maximum state,
  and then return to `0` (inactive).
- **sticky**: state will increment until reaching the maximum,
  and then return to `1` (first active).
- **linear**: state will increment until reaching the maximum,
  and then stay at the maximum until given more explicit direction.

{% warn 'Question' %}
Are there other simple defaults
that should be available at this level?
For example,
would `reverse-*` versions of each behavior
be useful?
{% endwarn %}

{% warn 'ToDo' %}
Currently only `sticky`
and the default full-cycle behavior
are defined in the specification.
{% endwarn %}

#### Toggle groups and scopes

Finally, there are two optional boolean keywords,
for grouping and scoping toggles:

- **group**: boolean (`false` if omitted)
  indicates if this toggle is part of a
  '[_toggle group_](#grouping-exclusive-toggles-toggle-group)'
  using the same name
- **self**:  boolean (`false` if omitted)
  optionally narrows '_toggle scope_' (what elements 'see' the toggle)
  to descendant elements (narrow scope) --
  otherwise a toggle is also visible to
  following siblings & their descendants (wide scope)

The default 'wide' scope is similar
to the way CSS counters behave,
while the 'narrow' (`self`) scope
is more similar to inheritance.

### Establishing toggle triggers (`toggle-trigger`)

Once a toggle has been established,
any elements inside the _scope_ of that toggle
can be set as 'triggers' for that scope,
using the `toggle-trigger` property.
Triggers would become activatable in the page
(part of the focus order, and able to receive interaction) --
so that user-activation of the trigger element
increments the state of one or more toggles.

{% warn 'ToDo' %}
Need to define what it means
to 'become activatable' --
including how that relates to future gestures,
beyond simple click/keyboard activation.
{% endwarn %}

The `toggle-trigger` property can be set to `none`,
or a comma-separated list of one or more
toggle-activation instructions.
Each instruction includes:

- The _name_ of the toggle to activate
- An (optional) _target state_ for the toggle

When a trigger is activated by a user,
then for each toggle listed,
if a toggle of that name is visible to the trigger,
its state is either incremented by 1 (default)
or moved to the _target state_ (if valid).

To trigger the color-mode toggle created above,
we could add triggers anywhere in the page
(since the toggle scope is the entire document in this case).
Triggers could either cycle the value,
or set it to a particular state.
The current spec allows these two formats:

```css
button[toggle-colors] {
  /* on activation: advance toggle to next state along default path */
  toggle-trigger: color-mode;
}

button[toggle-colors='dark'] {
  /* on activation: set toggle to a specific numbered state */
  toggle-trigger: color-mode 2;
}
```

Where possible,
I would expect named states
to be available by either name or number,
so that the example above establishes a `dark` state,
and would be identical to:

```css
button[toggle-colors='dark'] {
  /* on activation: set toggle to a specific numbered state */
  toggle-trigger: color-mode dark;
}
```

We also clearly need
a way to 'decrement' states --
for example,
allowing us to move backwards
in a slideshow or carousel.
The current spec does not define a syntax for this,
and doesn't have a clear way to add it.
I could imagine something like
(syntax TBD):

```css
.next {
  /* incrementing would be the default */
  toggle-trigger: slide;
  toggle-trigger: slide next;
}

.previous {
  toggle-trigger: slide previous;
}
```

In order to clearly delineate
between these default transitions
and direct changes 'to' an explicit state,
we could use a keyword prefix for the latter:

```css
.dark {
  toggle-trigger: color-mode to dark;
}
```

There is much more to explore
along these lines,
especially if we want to allow for
state-machine 'transitions'
that define [dynamic state changes](#triggering-dynamic-transitions).
I think that would make sense
as a level 2 extension of this proposal,
and a case that we should consider
while designing the syntax.

### Combined root and trigger shorthand (`toggle`)

While it can be useful to have them separate,
there are many use-cases where the same element
can act as both _root_ and _trigger_ for a toggle.
The `toggle` shorthand property
has the same syntax as `toggle-root`,
but establishes the element as both root and trigger.

For example,
a definition list:

```html
<dl class='accordion'>
  <dt>Term 1</dt>
  <dd>Long description......</dd>
  <dt>Term 2</dt>
  <dd>Another long description.....</dd>
</dl>
```

Could set each term as both a toggle  root
and a trigger for its own toggle:

```css
.accordion > dt {
  toggle: glossary;
}
```

{% note %}
When multiple toggles have the same name
and overlapping scope,
an element will only see the 'closer' toggle --
so each `glossary` toggle in the example
is only available to the `dd` element that comes immediately after
(before another `glossary` toggle is defined)
{% endnote %}

### Toggling visibility (`toggle-visibility`)

One of the common use-cases for this feature
is the ability to build various types of
'disclosure widget' --
from tabs and accordions, to popups, and details/summary.
It's essential that we make that
both simple to achieve and also accessible by default.
In many cases,
we want this 'off-screen' (temporarily hidden) content
to remain available for accessibility features,
in-page searching, linking, focus, etc.
The `toggle-visibility` property
allows an element to automatically tie its display
to the state of a particular toggle.

{% note %}
The existing
[`content-visibility` property](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)
provides an `auto` value,
allowing the contents to remain accessible
to various searching and accessibility features
like find-in-page, hash-navigation, or tab order,
when hidden from rendering --
but then to automatically become visible
when the element becomes relevant to the user.
The `toggle-visibility` property
would work similarly.
{% endnote %}

In addition to changing visibility based on the toggle state,
this allows us to change the toggle based on its visibility.
If a currently-hidden element becomes 'relevant to the user'
(through linking, search, etc)
then the toggle is set to an active state,
and the content is displayed.

The spec currently allows `normal` (no effect)
or `toggle <toggle-name>` values.
Using our definition-list example above,
we can add visibility-toggling to the definitions --
hidden by default,
but connected to toggle state
and available when relevant:

```css
.accordion > dt {
  toggle: glossary;
}

.accordion > dd {
  toggle-visibility: toggle glossary;
}
```

{% warn 'Question' %}
Should we extend this syntax to allow
associating an element `toggle-visibility`
with a _particular_ active state?
Something like
`toggle-visibility: toggle tabs 3;`
could associate the visibility of an element
with the 3rd active state of the `tabs` toggle.
See the [toc-style tab markup](#tabs-using-table-of-contents-code-order)
use-case, for example.
{% endwarn %}

{% note %}
The [Toggles Polyfill][polyfill] currently implements
`toggle-visibility` by simply applying `display:none`
without any of the expected benefits
that a browser implementation might provide.

[polyfill]: https://github.com/oddbird/css-toggles
{% endnote %}

### Selecting based on toggle state (`:toggle()`)

While toggling visibility is common,
there are often associated styles based on the same state
(e.g. styling the active tab, when its contents are visible) --
or toggles that don't relate to visibility at all.
The `:toggle()` functional pseudo-class
allows us to select elements based on the state of a toggle
(as long as the element is in that toggle's scope)
and style based on the toggle state.

The function itself requires a toggle-name,
and also accepts an optional integer
for selecting on specific active states
when there are multiple.

With our auto/light/dark mode example,
we can apply the color theme on the root element:

```css
html { /* auto settings, using media queries */ }
html:toggle(color-mode 1) {
  /* light mode color settings */
}
html:toggle(color-mode 2) {
  /* dark mode color settings */
}
```

We can also add active styling to the triggers:

```css
button[toggle-colors='dark']:toggle(color-mode 2) {
  border-color: cyan;
}
```

### Grouping exclusive toggles (`toggle-group`)

Toggles can also be grouped together
using the `toggle-group` property --
in which case only one toggle from the group
can be 'active' at a time.

This is similar to how radio inputs work in HTML,
but would also be useful in describing patterns like
tabs or exclusive accordions.

See the
'[tab and accordion toggle-groups](#tab-and-exclusive-accordion-toggle-groups)'
section
for a full example of this use-case.

{% note %}
Toggle groups are not the same
as '[focus groups](https://github.com/openui/open-ui/issues/401)'
proposed elsewhere.
The former impacts how _multiple toggles_ relate
(one active at a time),
while the latter allows _multiple triggers_
to be grouped in the tab order
(one tab-stop for all interactions).
Existing HTML radio input behavior
would require both features --
grouping both the trigger focus and states.
{% endnote %}

{% warn 'Question' %}
Would it be possible to address focus-grouping from CSS,
as part of this proposal,
or does that focus-management require an HTML attribute?
{% endwarn %}

### Javascript API for CSS toggles

It's important
that toggle states are both
'available to' JavaScript,
and can also be 'manipulated by'
scripting.

The details still need to be fleshed out,
but roughly we would want to:

- Expose a map of toggles on an element,
  associating each toggle name with the details of the toggle
- Ability to create toggles manually
- Ability to delete toggles manually
- Ability to set toggle state manually

I expect each state of a toggle
would have an optional name and number value exposed --
where predefined states have both a name & number,
but any trigger-defined states
only have one or the other
(as defined by the trigger).

{% note 'ToDo' %}
Needs details.
{% endnote %}

## Key scenarios

{% note 'ToDo' %}
Copy earlier examples into this section,
and flesh out additional use-cases.
{% endnote %}

### Binary switch

We can recreate the basic behavior
of a self-toggling checkbox
or switch component:

```css
.switch {
  toggle: switch;
}

.switch:toggle(switch) {
  /* style the active state */
}
```

{% note %}
See the
[binary switch demo](https://toggles.oddbird.net/#binary-switch).
{% endnote %}

### Details and accordion disclosure components

The behavior of a details/summary element
can be replicated:

```css
summary {
  toggle: details;
}

details > :not(summary) {
  toggle-visibility: toggle details;
}
```

This can be extended to a whole
list of elements,
to create a non-exclusive accordion:

```html
<dl class='accordion'>
  <dt>Term 1</dt>
  <dd>Long description......</dd>
  <dt>Term 2</dt>
  <dd>Another long description.....</dd>
</dl>
```

Where each term toggles the following definitions:

```css
.accordion > dt {
  toggle: glossary;
}

.accordion > dd {
  toggle-visibility: toggle glossary;
}
```

{% note %}
See the
[accordion demo](https://toggles.oddbird.net/#accordion).
{% endnote %}

Both of these examples
rely on the toggled content following the trigger element.
By moving the toggle-root to a wrapping element
we can avoid that restriction.
With this code,
the summary is no longer required to come first:

```css
details {
  toggle-root: details;
}

summary {
  toggle-trigger: details;
}

details > :not(summary) {
  toggle-visibility: toggle details;
}
```

### Color-mode preferences

It is very common for sites to support
both light and dark 'modes' for a site,
and provide a toggle between those modes.
Some sites also provide 'auto' mode (the result of a user-preference)
and/or additional modes like 'high-contrast'.

This use-case could be handled
with a toggle on the root element.
In this case I'm using the
proposed syntax for named states:

```css
html {
  toggle-root: mode [auto light dark];
}

html:toggle(mode light) {
  /* colors for light mode */
}

html:toggle(mode dark) {
  /* colors for dark mode */
}

.mode-btn {
  toggle-trigger: mode;
}
```

{% note %}
See the
[named-modes demo](https://toggles.oddbird.net/#named-modes),
and a similar
[named-colors demo](https://toggles.oddbird.net/#named-colors)
with individual triggers
for each state.
{% endnote %}

### Tree views

A tree view
can be created by nesting
the accordion/disclosure pattern:

```html
<ul>
  <li><a href='#'>home</a></li>
  <li>
    <button class='tree'>resources</button>
    <ul>
      <li><a href='#'>articles</a></li>
      <li><a href='#'>demos</a></li>
      <li>
        <button class='tree'>media</button>
        <ul>
          <li><a href='#'>audio</a></li>
          <li><a href='#'>visual</a></li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```

And applying the show/hide behavior
at every level:

```css
.tree {
  toggle: tree;
}

.tree + ul {
  toggle-visibility: toggle tree;
}
```

{% note %}
See the
[tree-view demo](https://toggles.oddbird.net/#tree-view).
{% endnote %}

### Tab and exclusive-accordion toggle-groups

Given the following HTML
(similar to the proposed 'spicy sections' element):

```html
<panel-set>
  <panel-tab>first tab</panel-tab>
  <panel-card>first panel content</panel-card>
  <panel-tab>second tab</panel-tab>
  <panel-card>second panel content</panel-card>
</panel-set>
```

We can define the exclusive/grouped behavior
using toggles:

```css
panel-set {
  /* The common ancestor establishes a group */
  toggle-group: tab;
}

panel-tab {
  /* Each tab creates a sticky toggle
    (so once it’s open, clicking again won’t close it),
    opts into the group,
    and declares itself a toggle activator */
  toggle: tab 1 group sticky;
}

panel-tab:first-of-type {
  /* The first tab also sets its initial state
    to be active */
  toggle: tab 1/1 group sticky;
}

panel-tab:toggle(tab) {
  /* styling for the active tab */
}

panel-card {
  /* card visibility is linked to toggle state */
  toggle-visibility: toggle tab;
}
```

The same CSS works,
even if additional wrappers are added
around each tab/card pair:

```html
<panel-set>
  <panel-wrap>
    <panel-tab>first tab</panel-tab>
    <panel-card>first panel content</panel-card>
  </panel-wrap>
  <panel-wrap>
    <panel-tab>second tab</panel-tab>
    <panel-card>second panel content</panel-card>
  </panel-wrap>
</panel-set>
```

{% note %}
See the
[panelset demo](https://toggles.oddbird.net/#panelset).
{% endnote %}

### Tabs using table-of-contents code order?

In order to properly layout tabs
as a group above the panel contents,
it's common for tab components
use a table-of-contents approach to the markup:

```html
<panel-set>
  <tab-list>
    <panel-tab>first tab</panel-tab>
    <panel-tab>second tab</panel-tab>
  </tab-list>
  <card-list>
    <panel-card>first panel content</panel-card>
    <panel-card>second panel content</panel-card>
  </card-list>
</panel-set>
```

This complicates things,
since we can no longer rely on
the flow of toggle-scopes
to associate each trigger
with an individual iteration of the toggle.

The rough behavior is still possible to achieve,
using a single sticky toggle
with multiple active states,
but it requires somewhat explicit
nth-of-type/nth-child selectors:

```css
/* shared toggle with an active state for each tab-panel */
panel-set {
  toggle-root: tabs 1/<tab-count> sticky;
}

/* each tab sets an explicit state */
panel-tab:nth-child(<tab-position>) {
  toggle-trigger: tabs <tab-position>;
}

/* each panel responds to an explicit state */
panel-card:nth-child(<tab-position>):toggle(tabs <tab-position>) {
  display: block;
}
```

There are several ways
we might be able to improve on this.
Most important, perhaps,
we could consider extending `toggle-visibility`
to accept not only a toggle name,
but also a specific active state.

{% warn 'Question' %}
Can we also improve on
the bulky/repetitive selector logic here?
That seems like it would require
a feature more like the `sibling-count()`/`sibling-index()`
[functions proposed elsewhere](https://github.com/w3c/csswg-drafts/issues/4559).
{% endwarn %}

### Carousels and slide-shows?

The current spec doesn't have great support
for carousel-like design patterns,
but it wouldn't take much to improve the basics.
Let's imagine the following html structure:

```html
<section>
  <article>…</article>
  <article>…</article>
  <article>…</article>
  <article>…</article>
</section>
```

We can add a toggle
to track the state of the carousel:

```css
section {
  /* 4 is the number of slides */
  /* sticky behavior starting at 1 ensures a slide is always active */
  toggle-root: slides 1/4 sticky
}
```

From here, we're in a similar situation to the
'table-of-contents' example above.
Ideally we would want some way to tie
`article` visibility to the specific state of our toggle.
Failing that, we can do something like:

```css
/* articles end up on the left */
article {
  transform: translateX(var(--x, -100%));
  transition: transform 300ms ease-out;
}

/* bring the active slide into view */
article:nth-child(<n>):toggle(slides <n>) {
  --x: 0;
}

/* move upcoming slides to the right */
article:nth-child(<n>):toggle(slides <n>) ~ article {
  --x: -100%;
}
```

For navigating the carousel,
both pagination controls and a 'next slide' trigger
would be straight-forward.
We just need to put them
anywhere visible to the `section` element:

```css
.next-slide {
  toggle-trigger: slides;
}

.to-slide-3 {
  toggle-trigger: slides 3;
}
```

At this point, we likely want a way
for triggers to reverse-increment,
so that we can also add a 'previous slide' trigger.

In many cases,
we would also want to control this carousel
using scroll,
in addition to (or instead of) buttons.
That would require further integration
with scroll/snapping behavior,
which hasn't been defined.

### Triggering dynamic transitions

In many state machines,
a given active state is able to describe
a the named 'transitions' that are available
for a triggering event.
Rather than having the trigger define
'what state to move to' explicitly,
the trigger would choose one of several
available transitions away from the current state,
and the transition itself determines the target state.

This may not be required in a first version
of CSS toggles,
but we should consider how/if
the syntax could be extended
to support this use-case.

My initial sense is that
we could allow this sort of 'state machine'
to be defined using an at-rule
(name TBD):

```css
@machine <machine-name> {
  <state-1> {
    <transition-1>: <target-state>;
    <transition-2>: <target-state>;
  }
  <state-2> {
    <transition-1>: <target-state>;
    <transition-2>: <target-state>;
  }
}
```

When creating a new toggle,
it could be based on one of these named machines
(syntax TBD):

```css
html {
  toggle-root: my-toggle machine(<machine-name>);
}
```

We could consider adding an setting
at the toggle-root level
to either enforce that all triggers
use named transitions (`strict`),
or optionally allow triggers
to choose between states, transitions,
and default incrementing:

```css
html {
  toggle-root: my-toggle machine(<machine-name>, strict);
}
```

On the trigger side,
we would need a syntax
that clearly references a transition name,
rather than a target-state name --
potentially a keyword or function
(actual syntax TBD):

```css
.save {
  /* move to an explicit target state */
  toggle-trigger: my-toggle to saved;
  toggle-trigger: my-toggle to(saved);

  /* trigger a named transition, that defines target state */
  toggle-trigger: my-toggle do save;
  toggle-trigger: my-toggle do(save);
}
```

As an example,
[Adam Argyle posted](https://github.com/tabatkins/css-toggle/issues/7#issuecomment-862779118)
this state machine diagram:

![fetch machine with initial state of idle, and fetch transition to loading, then resolve transition to success or reject transition to failure, with a retry transition that returns to loading](https://user-images.githubusercontent.com/1134620/122304047-6bee8f00-ceb9-11eb-99eb-27f7765b1b7c.png)

We could establish that as
a machine for CSS toggles:

```css
@machine fetch {
  idle {
    try: loading;
  }
  loading {
    resolve: success;
    reject: failure;
  }
  failure {
    try: loading;
  }
  /* as a final state, 'success' does not have transitions */
}
```

I've reused the `try`
transition name in place of `fetch` and `retry`,
so that a single trigger can
activate either transition,
as long as the machine is either
in a 'idle' or 'failure' state:

```css
form {
  /* maybe name can be optionally implied by machine()? */
  toggle-root: machine(fetch);
}

.try {
  toggle-trigger: fetch do try;
}
```

{% note %}
All of this behavior is already possible
with the specified syntax,
since trigger actions can be re-defined
based on the current state --
however, the result is difficult to read
or define clearly in a single place.
Each trigger would need to
define it's own transtions:
`.try:not(:toggle(fetch loading)) { toggle-trigger: fetch to loading; }`.
{% endnote %}

{% note %}
See the
[`@machine` demo](https://toggles.oddbird.net/#machine).
{% endnote %}

### Allow trigger-defined/unknown states?

The current spec requires a `toggle-root`
to establish all the possible states in advance,
along with a 'default' progression through those states.
Then `toggle-trigger` elements are allowed
to define more specific actions
(moving from one arbitrary state to another)
outside the default.

That is:
triggers can define arbitrary transitions between states,
but they are not able to define _new states_ --
only move between the previously-defined options.

An alternative approach might be
to consider both the `toggle-root` progression and states
to be 'defaults' --
while allowing both custom states
and custom transitions to be defined
at the trigger level:

```css
html {
  /* no states defined */
  toggle-root: page;
}

button.save {
  /* triggers can define arbitrary states */
  toggle-trigger: page saving;
}
```

New states defined by a trigger
would not have a number/name association,
and would fall 'outside' the default cycle behavior.
From there we would have to decide
if the default trigger event either:

- has no effect
- acts as a temporary 'maximum' value
  (so that events follow the established
  from-maximum transition described by either
  `linear`, `sticky`, or the default cycle behavior)

{% note %}
There have been many discussions about
how to express 'indeterminate' state
in the current syntax --
and in many ways this feature would be
similar to allowing 'indeterminate' states.
{% endnote %}

## Detailed Design Discussion

### Avoiding recursive behavior with toggle selectors

In order to allow selector access to toggles
(using the `:toggle()` functional pseudo-class)
without causing recursive behavior,
toggles exist and persist as independent state on a given element --
unaffected by any CSS properties.

CSS properties can only:
- create new toggles, and establish their initial state
- add or remove toggle-triggering behavior

### Accessibility implications

- a toggle-trigger element needs to become activatable/focusable/etc,
  and communicate in the a11y tree that it’s a checkbox/radio/etc
- we can infer what type of control it is
  by examining the properties of the toggle:
  if it’s part of a group, sticky, etc.
- if `toggle-visibility` is in use,
  we can also automatically infer all the tab-set ARIA roles

### Interaction between scrolling and toggles?

For the carousel, and other design patterns,
it would be useful to have a two-way integration
between toggles and scrolling/scroll-snapping,
so that:

- Scrolling/snapping could trigger active state
- Changing active state could change scroll position

### Other component interactions

There are several important interactions
with related features
that we need to keep in mind
(some may require additional research):

- gestures
  (long-term, toggles should not be limited to tap/click/enter activation)
- non-user trigger events
  (could be useful to trigger toggles from e.g. an animation event)
- tab/accordion '[panel set/section list][sl]' element (aka 'spicy sections')
- [popup][] attributes
  - can open/close use toggles?
  - can toggles work with 'light dismiss'?

[sl]: https://github.com/tabvengers/spicy-sections
[popup]: https://open-ui.org/components/popup

## Considered Alternatives

### Previous [CSS toggle states][] proposal

[CSS Toggle States]: https://tabatkins.github.io/specs/css-toggle-states/

{% note 'ToDo' %}Needs commentary{% endnote %}

### [Declarative show-hide][] explainer

[Declarative show-hide]: https://github.com/flackr/declarative-show-hide

{% note 'ToDo' %}Needs commentary{% endnote %}

## Stakeholder Feedback / Opposition

No known opposition.

## References & Acknowledgements

This proposal was heavily influenced
by the 'Declarative Show/Hide' work of
Robert Flack, Nicole Sullivan, and others:

- [Declarative show-hide repo](https://github.com/flackr/declarative-show-hide)
- [Declarative show-hide doc](https://docs.google.com/document/d/1HcQ75iRhO-dT7EHB6JrjmMATa9XlSCYZKWrXbzakexQ/edit?resourcekey=0-kYHpL3r3jY3Q8wtTaOa6aA#)

There is also a previous draft spec
written by Tab Atkins Jr.:

- [CSS Toggle States](https://tabatkins.github.io/specs/css-toggle-states/)
