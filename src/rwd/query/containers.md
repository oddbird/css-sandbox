---
title: Container Selection Syntax Implications
created: 2022-02-08
eleventyNavigation:
  key: query-containers
  title: Container Selection Syntax Implications
  parent: container-queries
warn: false
---

There are three big syntax issues
currently under discussion,
all related to how containers are selected
for a given query.
I want to summarize these all in one place,
with a clear proposal (or set of options)
to guide the discussion.

## Intro to container selection

```css
@container (inline-size > 40em) {
  .card {
    padding: 1em;
  }
}
```

In order to resolve a container query
like the one above,
we have to do three things:

1. Selector Matching:
   Once we match each `.card` element in the DOM,
   we have to do the next steps individually for each one.
   Different `.card` elements may have different containers,
   making the query true or false depending
   which container is queried.
2. **Container Selection**:
   The current WD spec looks for the _nearest ancestor container_
   of each card element,
   where a container is defined by having a set `container-type`.
   However we resolved recently to give every element
   a default `container-type: style`, which breaks that logic.
   These issues include revisiting that resolution,
   but also push forward on the implications of it.
3. Resolving Queries:
   Once we know what container to query for a given `.card` element,
   we can resolve the queries against the container,
   and conditionally apply our styles.

Currently the `@container` syntax is broken into two parts:

1. a `preamble` that handles any explicit container selection
2. followed by a list of `queries`

```css
@container <preamble> <query-list># {
  /* styles */
}
```

### The three issues being discussed

There are three issue threads
involved in this conversation:

1. [#6644 [css-contain-3] Determine container type automatically from the query][#6644]
2. [#6393 [css-contain-3] Provide a syntax to query a specific container-type][#6393]
3. [#6876 [css-contain-3] Multiple container-queries with multiple containers][#6876]

[#6644]: https://github.com/w3c/csswg-drafts/issues/6644
[#6393]: https://github.com/w3c/csswg-drafts/issues/6393
[#6876]: https://github.com/w3c/csswg-drafts/issues/6876
[#7020]: https://github.com/w3c/csswg-drafts/issues/7020

These issues all focus around
the logic & syntax for container selection --
and how that impacts the preamble syntax.
However, the implications of each issue
are highly intertwined,
so I'd like to discuss them all as a group.
From there we can break out individual resolutions.

(Some of these issues
are framed around the idea of style queries.
There's been a suggestion that we should
[defer style queries to level 4][#7020],
and I'm in favor of that move
if it helps clarify implementation steps.
But that won't allow us to defer these questions,
which are important to the overall syntax
of container queries.)

### Current behavior is problematic

Let's start with the following html.
To avoid the question (for now) about style containers being automatic,
I've listed the style type explicitly on every element.

```html
<html style='container-type: size style;'>
  <main style='container-type: inline-size style;'>
    <section style='container-type: style;'>
      <div class='card'>...</div>
    </section>
  </main>
</html>
```

Given that markup,
we can consider various container queries
that apply to the card element:

```css
/* requires either a `size` or `inline-size` container-type */
@container (inline-size > 40em) {
  .card { margin: 2em; }
}

/* requires a `size` container-type */
@container (orientation: portrait) {
  .card { margin: 2em; }
}

/* requires a style container-type */
@container style(font-style: normal) {
  .card { font-style: italic; }
}

/* requires a style container and an inline-size container */
/* (do they have to be the same container???) */
@container style(font-style: normal) and (inline-size > 40em) {
  .card { padding-inline: 2em; }
}
```

In the current spec,
containers are selected by:

- Any element with a `container-type` is considered a container
- All query conditions are resolved against
  the _nearest ancestor container of any type_,
  unless otherwise specified by an explicit name/type.
- If the queried container is the wrong type for a given condition
  (e.g. a size condition against a style container)
  then the query fails.

That means all of the size conditions above
would return false no matter the actual size available,
since the default container (the direct parent)
is only able to resolve style queries.
So we have some choices to make.

## #6644 Determine container type automatically from the query?

The proposal here is to allow the queries themselves
to impact the container selection process,
so that we use the
_nearest appropriate ancestor container_
based on what type of container is needed
to appropriately answer the conditions raised:

- If a condition requires `inline-size` knowledge,
  select from ancestor containers
  with `size` or `inline-size` container-type
- If a condition requires `block-size` knowledge,
  select from ancestor containers
  with `size` container-type
- If a condition requires `style` knowledge,
  select from ancestor containers
  with `style` container-type
  (currently all of them).
- Etc, as new container/query types are added,
  the selection mechanism can expand to handle their needs.

This is the behavior @fantasai are proposing.
We think this approach will:

- help authors avoid false-negatives
  when an improper container-type gets added
  between the element and its intended container.
- encourage a best-practice of using named containers
  when it's important to query against a specific container.
- allow us to remove the preamble syntax
  for explicitly querying a given `container-type`,
  since that's now handled for us.
  I don't see any use-cases
  for altering that implicit selection.

This is even more urgent,
since we resolved previously (in #6393)
to make `container-type: style` the default value on all elements --
which would mean that
the _nearest ancestor container_ of an element
is always the direct parent.
This proposal resolves that potential issue,
while also making it impossible
for the author to accidentally get themselves
in the same situation.

But this decision has implications
for the other two issues.

## #6393 Provide a syntax to query a specific container-type

Una has
[pointed out](https://github.com/w3c/csswg-drafts/issues/6393#issuecomment-1012446872)
that making every element a `style` container
is only useful when querying inherited styles.
For example, if you query the `background-color` of a container,
it may not be set on the parent,
but on an arbitrary ancestor.

While it might be reasonable to
search the ancestor tree for appropriate `container-type`,
it's not reasonable to search for
an appropriate property declaration.

She's proposed that we
reverse our decision on [#6393][]
(making every element a style container),
and also reject the automatic selection above.
In fact, _if we reject automatic container selection,
I think we have to reverse the style container choice._

That would take us back to:

- All containers are explicitly generated by the author
- All container queries use the nearest container,
  even if the type will cause an instant false negative.
- To avoid that risk,
  authors will need to always specify the name or type (or both)
  explicitly in the container preamble

Una can speak to that more, if she wants.

While I agree that the parent element
will be the wrong choice for some non-inherited styles,
I expect inherited styles
to be a very common use-case:

```css
em { font-style: italic; }
@container style(font-style: italic) {
  em { font-style: normal; }
}
```

(This is the same functionality
proposed elsewhere as a `toggle()` function --
recently [deferred to css-values-5](https://github.com/w3c/csswg-drafts/issues/6753).)

Additionally,
the argument seems circular to me.
If selecting the appropriate `type`
is only useful for avoiding false negatives --
but not specific enough
to ensure we're always getting the most useful container --
then container-type isn't what authors should use
for explicit container selection.
With or without the default style container-type,
it would be fragile to assume that
_the nearest style container will always have a background_.
Authors should be encouraged to use a `container-name`
whenever that level of specificity is needed,
(e.g. `container-name: has-bg`).

## #6876 Multiple container-queries with multiple containers

This last issue is still an open question,
no matter how we resolve the other two issues --
but it becomes especially relevant to clarify
if we follow the path @fantasai and I are proposing.

If we look at two of the single-condition queries above,
each one will now seek out the appropriate container
to resolve the condition:

```css
/* use the  `main` container: nearest inline-size type */
@container (inline-size > 40em) {
  .card { margin: 2em; }
}

/* use the `section` container: nearest style type */
@container style(font-style: normal) {
  .card { font-style: italic; }
}
```

But what happens if we combine
the two conditions in a single query?
What container/s are selected?

```css
@container style(font-style: normal) and (inline-size > 40em) {
  .card { padding-inline: 2em; }
}
```

We have a choice:

1. Use the nearest single container that is able to resolve all conditions
2. Allow each condition to select a different container.

The **first option**
(**which we prefer**)
means the way you ask the question
might change the answer you get.
But it helps keep things simple:
a single container query rule
only needs a single container-selection preamble,
and can always be resolved against a single container.

It's still possible to query multiple containers
by nesting the queries:

```css
@container style(font-style: normal) {
  @container (inline-size > 40em) {
    .card { padding-inline: 2em; }
  }
}
```

This gives us the `AND` of two queries
referencing two containers.
The `OR` version requires duplicated styles,
which is less ideal, but still possible.
Down the road,
we could still consider adding syntax sugar for this --
using the `@when` rule, or something similar
that can wrap our existing single-container syntax
in distinct functions.
That can be deferred for now
without holding up progress on the core functionality.

The **second option** means a single query
can (and will often) be resolved against multiple containers.
That also means we would want
a unique preamble for each condition.
There have been a few syntax proposals thrown around,
but so far nothing that strikes me
as clear and legible.

I'm not convinced it's a appropriate syntax sugar,
if it makes the simple use-case more complicated.

## Proposed resolutions

These are my proposed resolutions:

1. [#6644][#6644] When selecting a container,
   determine a container-type automatically
   based on the combined condition-types required in the query.
2. [#6393][#6393] Remove the container-type syntax
   from the preamble of the `@container` rule.
3. [#6876][#6876] A single `@container` rule
   resolves all conditions against the same container by default.
   Defer the question of additional syntax sugar to level 4.

And a possible follow-up:

4. [#7020][#7020] Defer style containers and conditions
   to level 4
