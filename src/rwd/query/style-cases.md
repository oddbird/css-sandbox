---
title: Use-Cases for Style Queries
created: 2022-08-09T17:17:31-06:00
eleventyNavigation:
  key: query-style-cases
  title: Use-Cases for Style Queries
  parent: container-queries
---

Browsers are preparing to ship
[size-based container queries](https://caniuse.com/css-container-queries)
and related
[container query units](https://caniuse.com/css-container-query-units).
However,
implementors have continued to raise questions
about the utility of
[style queries](https://drafts.csswg.org/css-contain-3/#style-container).

{% note %}
When people talk about container queries,
they are often referring specifically to '_size queries_' --
which allow us to query and respond to
the computed size of an ancestor container.

_Style queries_ allow us to also respond
in a similar way
to the computed values of any property
on an ancestor container --
such as the container
`background-color`, or `font-weight`.
{% endnote %}

While it's fine for browsers to ship
size queries without style queries,
we need to ensure that the syntax we ship
makes sense with all the planned future additions --
including at least `style` and likely `state` queries.

There has been
[significant discussion](https://github.com/w3c/csswg-drafts/issues/7066)
around this.
with many requests
that we show in more detail
the expected use-cases for style queries,
along with potential alternative solutions.

{% note %}
Chrome has started to implement
a prototype of _style queries_,
which may soon give us a better testing ground
for exploring use-cases.
{% endnote %}

{% note %}
Several of the demos below
come from other sources:

- Una Kravet,
  [Style query demos](https://codepen.io/una/pen/abqKvXW)
- Lea Verou & others,
  [Higher level custom properties](https://github.com/w3c/csswg-drafts/issues/5624)
{% endnote %}

## Simple value cycles

One of the common use-cases
seems to come with the best alternative solution,
at least in it's simplest form.
This is cycling one property-value
based on the value of the same property on the parent.

For example,
we can cycle the `font-style`
between `italic` and `normal` values
as we nest:

```css
em, i, q {
  font-style: italic;
}

@container style(font-style: italic) {
  em, i, q {
    font-style: normal;
  }
}
```

Now our `em`, `i`, and `q` tags
will be italic by default,
but will revert to normal when nested
inside an italic parent --
for example an `em` inside a `q`.

However, there's an
[existing proposal & spec](https://drafts.csswg.org/css-values-5/#funcdef-toggle)
for handling this use-case
with a function,
currently called `toggle()`:

```css
em, i, q {
  font-style: toggle(italic, normal);
}
```

## Complex value adjustments

In a case where the cycled styles
are limited to a single property,
the `toggle()` function is clearly a simpler solution.
But it has pretty strict limitations:

- One property cannot cycle
  based on the inherited value of another property.
- When multiple properties are involved,
  each has to be handled individually.

Instead of simply cycling between
italic and normal values,
we may want to give the nested version
a new background color,
or underline,
or other styles that make it stand out,
besides simply toggling the italics.

This is not possible with the functional approach,
but it becomes trivial with style queries:

```css
@container style(font-style: italic) {
  em, i, q {
    background: lightpink;
  }
}
```

Queries also allow us to use
multiple property conditions:

```css
@container style((font-style: italic) and (--color-mode: light)) {
  em, i, q {
    background: lightpink;
  }
}
```

Or apply the same query condition to multiple properties:

```css
@container style(font-style: italic) {
  em, i, q {
    /* clipped gradient text */
    background: var(--feature-gradient);
    background-clip: text;
    box-decoration-break: clone;
    color: transparent;
    text-shadow: none;
  }
}
```

None of those variations are possible
using the proposed `toggle()` function.

## Higher Level Custom Properties

Of course,
this sort of use-case is not limited to
handling nested italics.

We also expect this to handle
most of the use-cases raised by Lea Verou
and others
while discussing her proposal for
[higher level custom properties](https://github.com/w3c/csswg-drafts/issues/5624).

<!-- ```css
container: names / inline-size style;
size-container: inline-size;
style-container: style;
container-name: names;
``` -->

==Work in progress…==
