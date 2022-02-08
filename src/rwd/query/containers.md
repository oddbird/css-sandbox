---
title: Container Selection Syntax Implications
eleventyNavigation:
  key: query-containers
  title: Container Selection Syntax Implications
  parent: container-queries
---

There are three big syntax issues
currently under discussion,
all related to how containers are selected
for a given query.
I want to summarize these all in one place,
with a clear proposal (or set of options)
to guide the discussion:

## The summary

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

These issues all focus around
the logic & syntax for container selection --
and how that impacts the preamble syntax.

## [#6644 [css-contain-3] Determine container type automatically from the query](https://github.com/w3c/csswg-drafts/issues/6644)

### Current behavior

- Any element with a `container-type` is considered a container
- By default, all queries are resolved against
  the _nearest ancestor container_ of an element,
  no matter what queries are involved
  or what `container-type` was used to describe the container.
- If the container is the wrong type for a given query
  (e.g. a size query on a style container)
  then the query fails.

(Authors can explicitly provide a container name or type
in the `@container` preamble.)

Since we resolved (in #6393)
to make `container-type: style` the default value on all elements,
we now have a situation where
the _nearest ancestor container_ of an element
is always the direct parent.
That makes the question more urgent,
but even if we revert that decision
we still might want a more intelligent selection process.

### Proposed behavior

The proposal here is to allow the queries themselves
to impact the details of container selection,
so that we use the
_nearest appropriate ancestor container_
based on what is being queried:

- If any queries require `inline-size` knowledge,
  select from ancestor containers
  with `size` or `inline-size` container-type
- If any queries require `block-size` knowledge,
  select from ancestor containers
  with `size` container-type
- If style queries are present,
  select from ancestor containers
  with `size` container-type
  (though this is potentially all of them,
  and would have no impact)

(This matches the existing logic
used for container-relative units.)

**For example**:
Here are three nested containers,
and a `.card` element:

```html
<html style='container-type: size'>
  <main style='container-type: inline-size'>
    <section style='container-type: style;'>
      <div class='card'>...</div>
    </section>
  </main>
</html>
```

Depending on the queries present,
we query a different container
for the same `.card`:

```css
/* query the section (style) container */
@container style(font-style: normal) {
  .card { font-style: italic; }
}

/* query the main (inline-size) container */
@container style(font-style: normal) and (inline-size > 40em) {
  .card { padding-inline: 2em; }
}

/* queries the section (style container) */
@container (orientation: portrait) {
  .card { margin: 2em; }
}
```

There's some potential for confusion here,
since the question you ask
changes the target container being queried.
But in most cases,
this seems better than allowing queries to fail
simply because an intervening container
had the wrong type to provide an answer.

### Additional considerations

If we agree to go this direction,
it raises two additional questions:

1. Do we still need any way to query explicit container-types in the preamble?
   _I don't see any obvious use-cases for it._
2. When a container-name is provided in the preamble,
   does that replace the automated selection,
   or do we look for a container with appropriate name AND type?
   _I would expect to get a container of correct name AND type._

### Proposed resolutions

1. When selecting a container to query,
   determine a container-type automatically
   from the types of conditions
2. Explicit container-selection preambles
   are combined with the automatic selection logic

## [#6393 [css-contain-3] Provide a syntax to query a specific container-type](https://github.com/w3c/csswg-drafts/issues/6393)

### Proposed resolution

If we keep our previous resolution
to make all elements default to `container-type: style`,
and we resolve on the proposal above,
then I think we can resolve to:

1. Remove container-type from the container preamble.

## The alternative

Una has
[pointed out](https://github.com/w3c/csswg-drafts/issues/6393#issuecomment-1012446872)
that making every element a `style` container
(and therefor defaulting to direct-parent queries)
is not a good assumption for non-inherited styles.
For example, if you query the `background-color` of a container,
it may not be set on the parent,
but on an arbitrary ancestor.

She's proposed that we remove this implicit behavior,
and also reject the implicit selection behavior above.

I agree that it's the wrong assumption
for some queries,
but I think it's the right assumption
for some inherited styles.
I expect this to be a very common use-case:

```css
em { font-style: italic; }
@container style(font-style: italic) {
  em { font-style: normal; }
}
```

Additionally, I think it sets the right precedent
for using a `container-name` whenever more clarity is needed.
It would be fragile to assume that
_the nearest style container will always have a background_,
and it would be more readable and more robust
to query for a container with e.g. `container-name: has-bg`.

Im convinced that having smarter implicit selection
makes the code more clear and more robust
in the long run --
with explicit container-selection
using the container names
rather than their types.

## [#6876 [css-contain-3] Multiple container-queries with multiple containers](https://github.com/w3c/csswg-drafts/issues/6876)

Bramus has suggested
that we also consider allowing
a single `@container` rule
to query conditions on multiple different containers.

### Already possible with nested rules

According to the current draft,
this functionality is already be possible
by nesting `@container` rules:

> Style rules defined on an element
> inside multiple nested container queries
> apply when all of the wrapping container queries
> are true for that element.

Since each container query
handles selection of containers internally,
each nested rule can be used
to query aspects of different containers.

Combined (`AND`) conditions
are relatively straight forward:

```css
@container inline-container (inline-size > 30em) {
  @container block-container (block-size > 30em) {
    .child {
      /* conditions match on both containers! */
    }
  }
}
```

`OR` conditions are a bit more awkward,
as the entire style-block would need to be duplicated

```css
@container inline-container (inline-size > 30em) {
  .child {
    /* conditions match on inline-container! */
  }
}
/* OR */
@container block-container (block-size > 30em) {
  .child {
    /* conditions match on block-container! */
  }
}
```

### Do we want syntax sugar for this?

If we think this is worth addressing
with some syntax sugar
to allow querying multiple containers
in a single rule,
we have a few options
depending on the default behavior we want.

By default, we assume:
1. all conditions are queried against the same container (current behavior).
2. each condition will find its own container to query.

In the **first case**
we would need a syntax to break conditions apart,
into multiple container groups.
This would be similar in some ways to the `@when` rule
providing wrappers around existing conditions:

```css
/* query a single container by default */
@container (inline-size > 30em) and style(--card: true) {
  .child { /*...*/ }
}

/* allow specifying multiple containers */
@container from(layout-a (inline-size > 30em))
       and from(layout-b style(--card: true)) {
  .child { /*...*/ }
}
```

One advantage of this approach
is that we might be able to ship the default behavior unchanged,
and then solve this problem
in another level of the spec.

In the **second case** we need a way to group conditions
that should be using the same container:

```css
/* query multiple containers by default */
@container layout-a (inline-size > 30em)
       and layout-b style(--card: true) {
  .child { /*...*/ }
}

/* allow grouping multiple conditions */
@container layout-a (
             (inline-size > 30em) and style(--card: true)
           ) {
  .child { /*...*/ }
}
```

The potential advantage here
is that the nested and un-nested versions
behave the same by default:

```css
/* potential to query multiple containers by default */
@container (inline-size > 30em) and style(--card: true) {
  .child { /*...*/ }
}

@container (inline-size > 30em) {
  @container style(--card: true) {
    .child { /*...*/ }
  }
}
```

The downside is potentially less clarity.

### Proposal

These aren't meant as final syntax proposals.
I think either approach might need more time
to bikeshed the details in the issue.

I see three paths:
- Close no-change (we don't need this)
- Keep the current single-container default,
  and defer the issue as we work out the details
- Switch to a multi-container default,
  and prioritize finalizing the syntax
