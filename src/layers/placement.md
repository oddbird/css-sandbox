---
title: Ordering of Unlayered Styles
created: 2021-10-20
eleventyNavigation:
  key: placement
  title: Ordering of Unlayered Styles
  parent: layers
note: |
  The full discussion is happening in
  [CSSWG-drafts issue #6323](https://github.com/w3c/csswg-drafts/issues/6323)
---

By default,
we've established that author layers
stack "below" any unlayered styles.
However,
there are many use-cases
for establishing layers (like utilities & overrides)
"above" the default/initial unlayered styles.

To make this more complicated:

- [@alohci has pointed out](https://github.com/w3c/csswg-drafts/issues/6323#issuecomment-874354775)
  that _if we allow_ layering
  both above and below the initial styles,
  we _must also allow_ this in a nested context --
  so e.g. `framework.theme`
  can be placed above or below
  `framework (unlayered)`.
  That's required because
  any document may describe these relationships
  at the document root,
  but then be layered on import,
  placing these rules in a nested context.
- [@FremyCompany suggested](https://github.com/w3c/csswg-drafts/issues/6323#issuecomment-937193023)
  that we might also need a way
  to define new layers as above or below the default
  without knowing up-front where the initial layer belongs
  in relation to all other layers.

While the discussion is happening on
[CSSWG-drafts issue #6323](https://github.com/w3c/csswg-drafts/issues/6323),
I wanted a place to track the proposals so far --
in no particular order.

(All the keywords/names still need discussion.
I'm more interested in the overall mental models at this point.)

## Name the implicit unlayered layer, and place it in the order explicitly

The [original proposal](https://github.com/w3c/csswg-drafts/issues/6323#issue-905996667)
was to place the initial layer itself
in our layer order explicitly.
For now, we'll do that using the `initial` keyword:

```css
@layer reset, framework, initial, utilities;
```

If not placed explicitly,
the `initial` layer is placed at the top/end of the layer stack.
That means explicit placement of the `initial` layer
is only required when we want to add layers above it.

Since the `initial` keyword can be used in any nested context,
it meets the requirement for use at any level:

```css
@layer framework.resets, framework.initial, framework.components;
```

Nothing can be layered _inside_ the `initial` layer.
These would be invalid:

```css
@layer initial.defaults;
@layer framework.initial.utilities;
```

On it's own,
this does not provide a built-in way
to add new layers above or below the initial layer
from anywhere in the document.
Authors could do that manually,
by establishing a convention like:

```css
@layer down, initial, up;
@layer down.reset { … }
@layer up.utilities { … }
```

I like that this avoids any special syntax,
but it would be very easy to accidentally override
the placement of initial styles
when combining multiple documents:

```css
/* framework.css */
@layer defaults, initial, overrides;

/* site.css */
@layer reset, initial, utilities;
@import url(framework.css);
```

Unless we're careful to nest the `framework.css` styles
inside their own layer,
we've accidentally pushed framework-defined `defaults`
after the globally defined `initial`.
That problem already exists
for author-defined layers:

```css
/* framework.css */
@layer defaults, patterns, overrides;

/* site.css */
@layer reset, patterns, utilities;
@import url(framework.css);
```

So this isn't a new problem,
but since `initial` is a special layer,
it may deserve some special care here?

## Layer "anchoring" relative to implicit initial layer

After some conversation with @fantasai,
we believe it would be possible to handle that special case
by restricting `initial` to the layer-list syntax,
and treating it as an anchor for other layers in the list,
rather than a distinct layer-name.
Layers before `initial` are added below,
and layers after `initial` are added above.
That would mean:

```css
/* _framework.css */
@layer defaults, initial, overrides;

/* site.css */
@layer reset, initial, utilities;
@import url(_framework.css);
```

Is the same as:

```css
@layer reset, initial, utilities;
@layer defaults, initial, overrides;
```

And results in the following layer order:

1. `reset`
2. `defaults`
3. `initial`
4. `utilities`
5. `overrides`

There is still potential for name collisions
changing the intended order of layers,
but only when author names collide.
For example:

```css
@layer initial, framework;
@layer framework, initial;
```

In this case we would want to follow
established conventions for name collision --
such that the first mention takes precedence.
That would result in:

1. `initial`
2. `framework`

The inverse can also be resolved
using our existing rules.
Any of these options:

```css
/* single list */
@layer framework, initial, framework;

/* split v1 */
@layer framework;
@layer initial, framework;

/* split v2 */
@layer framework;
@layer initial, framework;
```

In order to create a new layer
above `initial` on-the-fly,
authors could write e.g.:

```css
@layer initial, utilities;
@layer utilities { … }
```

Note: Given that approach,
the following are meaningless,
and should be treated as invalid:

```css
/* nothing is being anchored */
@layer initial;

/* can't anchor twice */
@layer initial, framework, initial;
```

I'm not sure if this special-casing is really warranted?

## An implicitly generated "override" layer, with author sub-layers

Another option
[proposed by @FremyCompany](https://github.com/w3c/csswg-drafts/issues/6323#issuecomment-939655516)
is to add a _second_
implicit layer that is available for authors
above the initial layer.

- There is a single "stack" of layers and sub-layers
- That stack includes two implicit layers: one for unlayered styles,
  and the other for overrides
  (using a reserved name like `!important` or `initial`)
- By default, author-defined layers are added below the unlayered styles
- Authors can also add styles & sub-layers to the implicit overrides layer

```css
* { … }
@layer reset, framework, theme;
@layer !important {
  * { … }
  @layer utilities { … }
}
```

This would result in the following layers
(from lowest to highest priority):

1. `reset`
2. `framework`
3. `theme`
4. (unlayered)
5. `!important.utilities`
6. `!important` (unlayered)

But we run into the same problem at every layer of nesting.
Using this approach, we would need to do something like:

```css
/* resets go below !important.framework unlayered */
@layer !important.framework.resets;

/* components go above !important.framework unlayered */
@layer !important.framework.!important.components;
```

It's bulky, but it works.

This syntax has the advantage
of building on the existing mental model of layers & nesting.
However, the syntax can get a bit complicated,
and inconsistent between upper/lower styles.
It also requires having multiple implied layers,
reserving multiple layer names.

## Required keywords for managing upper & lower layer stacks

Another approach is to have two distinct stacks,
one above and one below the unlayered styles.
Authors could add to either stack.
This could be achieved by naming both stacks
(something like `!important` and `!default`),
and having all author layers be nested inside one or the other.
However, that leads to an even more bulky syntax.
Instead, @fantasai has proposed a seperate `up`/`down` keyword
at the start of every `@layer` rule:

```css
* { … }
@layer down reset, framework, theme;
@layer up utilities { … }
```
Which would result in:

1. `reset`
2. `framework`
3. `theme`
4. (unlayered)
5. `utilities`

There's an elegance to it,
especially when defining multiple layers at once.
This also provides consistency between upper & lower layers.

But I don't see any clear way
to describe nested up/down layers
using the dot notation.
The keyword is either applied to the first segment of a name,
or to all segments,
but can't be applied to individual parts of a nested name.
It would have to be done through
explicit longhand nesting of blocks
(or document imports):

```css
/* resets go below framework unlayered */
@layer above framework.resets { … }
@layer above framework {
    /* no clear way to reference this from outside framework */
    @layer above components;
}
```

❌ I don't think this option is viable.

## Create upper layers by nesting directly inside `initial`

This was
[proposed by @tabatkins](https://github.com/w3c/csswg-drafts/issues/6323#issuecomment-939147623),
but it relies on a bit of logic
that is no longer accurate.
Tab says:

> We do at least let styles arbitrarily inject themselves
> after a given layer via nesting;
> ==an `@layer foo.bar{...}` comes after all the "foo" layer styles.==
> We could allow nesting under initial
> (assuming that's what we call the default layer)
> to let people achieve some of this,
> in a way that's consistent with any other layer.

The highlight is mine.
Since we determined that
unlayered styles now have top priority,
the reality is `foo.bar` _comes before_
all the layer styles.

In order for their proposal to work,
we could need to special-case `initial`
in confusing ways.

❌ I don't think this option is viable.
