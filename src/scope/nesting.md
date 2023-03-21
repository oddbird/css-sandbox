---
title: Nesting, Scoping, and Proximity (a FAQ)
created: 2023-03-21
eleventyNavigation:
  key: scope-nesting
  title: Nesting, Scoping, and Proximity (a FAQ)
  parent: scope
---

## Do we really need both scoping and nesting?

Scope and nesting have some surface similarities,
and nesting _can be used_
(and has often been the only available tool)
to express scope-like relationships.
However, they diverge significantly from there.

At it's core,
the _nesting_ feature is
a semantically meaningless syntax sugar
to help authors express
any compound or complex selector
in a more terse and elegant way.
While the resulting selector
may involve ancestor/descendant relationships
(DOM nesting),
that is only one use-case among many others.
The fact of one selector fragment
being 'nested' inside another
does not imply any particular relationship
in the final selector:

```css
.parent {
  .child:has(~ &) {
    /* .child:has(~ .parent) */
  }
}
```

_Scoping_, on the other hand,
is a semantic tool used to express
a specific relationship
between two or three matched elements.

- The scope 'root' element
- Any optional scope 'boundary' elements
  (which are only matched as descendants of the 'root')
- Any scoped 'subject' selectors,
  which only match the scope root or it's descendants,
  so long as there are no intervening 'boundary' elements

These are three distinct selectors,
matching distinct elements in the DOM.
The 'root' and 'boundary' together are used
to establish a tree-fragment 'scope' --
and then subjects are restricted to match elements
inside that given fragment:

```css
@scope (.parent) {
  .child:has(~ :scope) {
    /* not possible to target subjects outside the scope */
  }
}
```

Even where there is overlap
(when nesting is used to express
ancestor/descendant relationships)
this semantic distinction is important.

- The result of _nesting_ is
  a single selector list
- The result of _scoping_ is
  two or three distinct selector lists

This also plays out in the difference
between `&` or `:scope`
as ways of referencing context
in a wrapped selector.
The `&` selector (from nesting)
is a simple placeholder that can be replaced
by the wrapping selector fragment.
That fragment may match multiple elements

```css
.context {
  & + & > & {
    /* .context + .context > .context */
  }
}
```

The scope selector,
instead,
references a single element:
_the root of the current scope_.
That element can't have a relationship to itself,
so the selector above would not make sense
in a scoped context.

In order to merge the features,
we would need to choose one behavior or the other.
So instead, we've done what we can to
_differentiate_ where they overlap:

- Nesting generates a single selector
  with a single specificity,
  while scoping keeps the selectors distinct
  and does not apply the root or boundary specificity
  to the scoped selectors inside
- Even when nesting inside an `@scope` rule,
  the `&`/`:scope` selectors maintain their distinct behaviors.

## Should scope be an at-rule or a selector syntax?

This need for matching
two or three distinct elements
to generate a scope --
and then matching additional selectors inside that scope --
makes it difficult to represent 'scope'
in a selector syntax.
How do you keep the three selectors
distinct from each other?

Since a scope includes everything from a specific matched root
until boundaries inside that root,
the scope 'root' and 'boundary' selectors
need to be explicitly associated with each other.
At first, we tried capturing that in parenthesis,
with a new `/` divider between the scope
start and end selectors:

```css
(.root / .boundaries) .subject { /* … */ }
```

In the simplest case, this makes sense.
But the fact that this syntax lives mid-selector
adds potential for a lot of confusion.
Each part of that selector can extend out
to a full list of complex selectors --
and also arbitrarily nested inside a selector list.

Are additional prefixed selectors
applied to the scope or the subject or both?

```css
.context ~ (.root / .boundaries) .subject { /* … */ }

/* which of these do we mean? or something else? */
(.context ~ .root / .context ~ .boundaries) .context ~ .subject { /* … */ }
(.context ~ .root / .boundaries) .subject { /* … */ }
(.root / .boundaries) .context ~ :scope .subject { /* … */ }
```

Which raises the question,
what does `:scope` refer to in the selector above?
Does it take meaning from the broader context outside the selector,
or does it refer to the scope root defined mid-selector?

If we nest scopes, how does that work?

```css
((.outer / .scope) :scope .root / .boundaries) :scope > .subject { /* … */ }
(.outer / .scope) :scope (.root / .boundaries) :scope > .subject { /* … */ }
```

Also, the scope part of the selector
doesn't match any one element, but an entire tree fragment
that the subject has to be within.
Either we would need to disallow scopes as the right-most subject,
or imply a `*` selector at the end.

All of these are solvable problems
(and some can even be recreated with nesting the at-rule) --
but in general the at-rule helps
by keeping the three selectors distinct:

- The at-rule does not accept directly-nested declarations,
  so it can never be the subject
- There is one clear syntax for nesting scopes,
  by putting one at-rule inside another
- Each at-rule updates the meaning of `:scope`
  for selectors inside the rule,
  so it never has multiple meanings in a single context.
- There is no way for a scope rule to end up inside pseudo-selectors,
  so we don't have to explicitly disallow that either.

While it would be possible to define all the same behaviors
in a selector syntax,
it would require a whole list of special 'limitations'
for authors to memorize --
limitations that are already implicit as part of an at-rule syntax.

A selector syntax is also harder to extend in the future,
if we want sibling scopes, or inclusive vs exclusive boundaries --
all of that detail has to be handled mid-selector,
either relying on ascii art, or some other new syntax.
In an at-rule, we can more simply provide keywords in a prelude.

But maybe even more importantly,
**the purpose of scope is always to be a wrapper**.
What makes selector syntax powerful
is the flexibility of combining different elements
in complex ways to create new matching behavior.
But with scope, we always want:

- to define a 'scope' sub-tree that will limit our matches
- select specific elements in that 'scope' tree

That's a semantic intent clearly expressed
by nesting selectors inside a scope rule.
Removing the at-rule doesn't remove the intent,
but only makes it more implicit --
and increases the chance for author mistakes.

(The proposed `>>`/`~~` combinators have raised similar issues,
which can only be resolved by parsing out
distinct subject elements from a single selector --
and can get into similarly meaningless situations.
While that's possible to define,
I'm not sure that the results are clear,
or have a distinct use-case apart from being
potential syntax sugar.)

## Why combine lower boundaries and proximity in a single feature?

Both of these behaviors
allow authors to establish limits
on the lower end of a component 'scope'.
Lower boundaries provide a hard limit
(no elements match beyond this point)
while proximity provides a softer 'giving way'
of priority to more narrowly targeted scopes.

We can see the similarity of purpose
in the fact that one of our core use-cases
could be expressed
either relying on lower boundaries
or proximity:

```css
/* avoid conflicts through lower boundaries */
@scope (.light-mode) to (.dark-mode) {
  a { color: blue; }
}

@scope (.dark-mode) to (.light-mode) {
  a { color: powderblue; }
}

/* resolve conflicts through proximity */
@scope (.light-mode) {
  a { color: blue; }
}

@scope (.dark-mode) {
  a { color: powderblue; }
}
```

The cascade-proximity heuristic
is a useful last-catch
for handling the cases where hard boundaries
would be too invasive --
but both are expressing the same concept
of an inner scope priority.

These two approaches also rely on the same
approach to element targeting.
The first step is to define the individual elements
that form 'scope roots'.
then we can match the subject elements
in relation to those root elements
and determine:

- If there are intervening lower boundary elements
- How many steps of the tree exist between the subject and root

Neither of those can be determined
without separately matching
two or more distinct elements,
each with it's own selectors:

```css
@scope (<start>) to (<end>) {
  <subject> { ... }
}
```

1. `<start>`: the scope root
2. `<end>` (optional): the lower boundaries
3. `<subject>` the elements to style

So in both 'author intent'
(balancing inner/outer priorities)
and 'technical approach'
(multiple selector subjects)
these two features are well aligned
to work as a pair.

## Should 'proximity' override 'specificity'?

(We call it 'weak' proximity,
when it falls under specificity in the cascade --
or 'strong' proximity if it overrides specificity.)

In practice,
lower boundaries and a 'weak'
cascade proximity
represent both 'strong' and 'weak' approaches
to avoiding scope conflict,
and giving priority to the inner-most rules.

Scope boundaries are explicitly defined,
and avoid cascading conflicts
by instead limiting the reach of a selector.
This is a 'strong' guard
against outer styles
influencing nested scopes.

In many cases as well,
different 'types' of scope
fall neatly into different layers.
For example, broader 'color theme' scopes
are likely to live in a lower layer
than narrow 'component' scopes.
That layering can be handled in CSS,
without relying on DOM proximity.

On the other end,
cascade proximity
is a _heuristic_ that can help
in situations where more explicit
rules don't make sense.
This situation primarily comes up
when two scopes have similar intent
(and are therefor in a similar layer,
with similar specificity).

In practice,
what we've found is that:

- Since proximity is a heuristic,
  it is not reliable as a primary determining factor
  between all scopes
- Since proximity is determined by the DOM,
  and specificity can be adjusted in CSS,
  it's useful to have the more 'controllable'
  heuristic take precedence
- Since layers and scope both
  help authors reduce specificity all-around,
  there are more and more situations
  where 'code order' is the determining factor in the cascade,
  and proximity provides a better resolution in those cases

Because of those considerations,
authors who have explored the current prototype --
including many who came in expecting to argue for
'strong' proximity --
have so far consistently preferred
the 'weak' approach.

While I'm sympathetic to the sense
that 'specificity is unreliable as a heuristic',
I think we need to be careful not to assume
that 'therefor proximity would be more reliable'.
Both are heuristics that
can be useful as sorting mechanisms --
but neither one provides an air-tight mechanism
for author control.
And in practice, specificity provides more author control
over the final results.

The other counter-argument that's come up is:
_if we don't want it to be strong, do we need it at all_?
To me, this misses a few things:

- Relying on code order,
  the weakest step of the cascade,
  is _not at all an edge case_.
  Many many cascade conflicts get to that final step
  before being resolved.
- CSS is a language built on semantic and declarative rules,
  where _finesse_ is often the best solution to a problem.
  Giving a heuristic more power
  does not make it more useful --
  only more likely to override other considerations.
