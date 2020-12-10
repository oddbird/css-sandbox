---
title: Containment
eleventyNavigation:
  key: containment
  title: Containment
  parent: container-queries
---

Layout and Size containment are supported
in all major evergreen browsers:

```css
.sidebar {
  contain: layout size;
}
```

## [Layout Containment](https://drafts.csswg.org/css-contain/#containment-layout)

Isolates the layout-impact of contents in several ways:

- Generates an [independent formatting context](https://drafts.csswg.org/css-display-3/#independent-formatting-context)
- Contains fragmentation-flow (CSS Regions)
  and forced fragmentation breaks (`break-before`, `break-after`)
- Any `visible`/`clip` overflow is
  [ink only](https://drafts.csswg.org/css-overflow-3/#ink-overflow)
- Creates a positioning context for both `absolute` & `fixed` children
- Creates a stacking context for `z-index`
- For alignment, the box is treated as though it has no baseline

This ensures that:

- The contents of a layout container
  will not impact the layout of contents in another container
- Layout can be delayed if the container is off-screen,
  and will not effect on-screen boxes
  (e.g. it's farther down in a block context)

## [Size Containment](https://drafts.csswg.org/css-contain/#containment-size)

Isolates the size-impact of contents:

- Intrinsic size & final layout size are determined
  as though the container is empty
- Fragmentation is contained

This feature primarily exists to make container queries possible.
When combined with layout containment, it allows:

- Rendering engines to optimize performance
  by ensuring that internal changes
  will never require external layout adjustments
- Off-screen rendering can be delayed

## Is single-axis containment even possible?

- CSSWG [1D containment issue](https://github.com/w3c/csswg-drafts/issues/1031),
- Brian Kardell's [css-observers issue](https://github.com/bkardell/css-observers/issues/11)

2-axis size containment might work for some app-style layouts,
where layout areas are sized to the viewport,
and each area is a scroll-container.
But most web layout relies on specifying inline-size (often horizontal),
and allowing content to expand or contract
on the block-axis (often vertical).

We need container queries to support that more common use-case.

Conceptually, single-axis containment should not be hard to implement
_if we can describe how it works_.
But that may still be challenging...

Single-axis containment only works
if we can ensure that changes in the cross-axis
have no impact on the contained axis.
There are several places where CSS makes that difficult:

### Scrollbars

When a parent element has `auto` scrolling,
extra cross-axis size can cause scrollbars
to appear on the contained-axis.
This is only an issue when all three are true:

- Scrollbars are part of the layout flow (they are not overlaid)
- Overflow on the cross-axis is set to `auto` on _any ancestor_
- The contained size is impacted by the size of that ancestor

This could be solved by
forcing in-flow `auto` scrollbars to be always-visible
when there are nested single-axis containers.

### Percentage Padding

Block-axis percentage padding & margins
are resolved relative to the inline available size.
That would cause issues when:

- Containment is on the block-axis
- Any ancestor has inline-size determined by contents
  (float+auto, min-content, max-content, etc)
- Any intermediate ancestor has:
  - box-sizing of border-box
  - height determined by the outer ancestor
  - % padding on the block-axis
    (so inner-height decreases as outer-width increases)
- The container block-size is impacted
  by the inner-size of that ancestor

See
[contain-y comment](https://github.com/w3c/csswg-drafts/issues/1031#issuecomment-379463428))
and related
[codepen demo](https://codepen.io/anon/pen/aYQLvV?editors=1100).

That issue is most likely to occur
when containing the block-axis,
but nested writing modes
can flip the impacted axis
([contain-x with writing modes](https://github.com/w3c/csswg-drafts/issues/1031#issuecomment-722980450)).

It's interesting that browsers
are already inconsistent about rendering that last demo.
They also disagree on simpler
[percentage calculations](https://codepen.io/mirisuzanne/pen/9f46dc0b9e57f0f2e0cd46b6b5898d67?editors=1100)
when "in a particular axis,
the containing block’s size depends on the box’s size"
[[Box Sizing 3](https://www.w3.org/TR/css-sizing-3/#sizing-values)].

The sizing/layout specs all have
module-specific caveats for handling those cases.
This seems to me like it could be solved
with one more caveat?
Not solved as in _perfect layout_,
but at least _consistent & implementable_,
without infinite loops.

I have trouble imagining actual use-cases
that would require this to behave well.

### ✅ Option: Containment with edge-cases

If 1D containment is needed,
we would need to make some hard decisions
about how the cases above _fail consistently_
while maintaining containment.
This isn't ideal,
but may also be a worthwhile tradeoff for authors.
It would take some more discussion, but something like:

1. For the sake of determining auto scrollbars on ancestors,
  the container contributes an infinite cross-axis size
  (always trigger the scrollbar).
  This is probably the more common edge-case,
  but I also think auto-scrollbars _might often_ imply
  an element has containable size on the cross-axis --
  so authors could avoid this by using 2D size containment in those cases?
2. For the sake of resolving percentage-padding on the contained axis,
  always resolve to `auto`.
  Maybe there's a better solution here,
  but I think this is the existing first-pass behavior
  in many cases where an element has unknown size --
  so it's a starting-point.

This may not be a complete list of issues/solutions,
but the point is that it shouldn't _block_
an attempt at moving forward.
A prototype would help us expose/address additional issues.

### ❌ Option: No containment ("pinky promise")

_According to browser engineers, this approach won't be possible._

Anders proposed this as a solution.
I don't know how feasible it is to implement,
but I like it in theory. What if:

- We evaluate the CQ against the size the container _would have_
  if `contain:size` was specified.
  - A CQ then implies a _promise_ of containment from the author,
    at least for the axes present in the CQ expression.
  - Layout proceeds without size containment.
    The actual result of the layout has no effect on CQ evaluation.
  - In other words, if the author breaks their promise,
    the CQ will still evaluate as if they hadn't.
    (The CQs won't be evaluated again).
- For the problematic "ancestral scrollbar" case,
  we'll automatically evaluate the CQ twice
  (since we're doing layout twice),
  so the second pass would have the CQ evaluate
  against the scrollbar-aware size.
  - However, if that second pass changes CQ evaluation
    such that the scrollbar wouldn’t be needed after all
    (e.g. by setting things to `display:none`
    when the container is below a certain width),
    then the scrollbar remains.

There is some danger that this makes it too easy
for authors to stumble into "promise-breaking" behavior,
where the container query reports a size
significantly different from the final layout dimensions.
But the advantages might be enough to offset that concern.
It might be worth testing in a prototype.

#### Would it make layout "stateful"?

See [Florian's comment on the CSSWG thread][state]

[state]: https://github.com/w3c/csswg-drafts/issues/1031#issuecomment-737054969

#### How would this interact with floats?

Eric Portis asked:

> Are queries in the block direction,
> or on floated elements,
> all going to evaluate against 0, then?
> I do worry this’ll be confusing…

I think the answer is _yes_,
but I'm not sure containment improves this.
None of the options fully support a query against
elements that take their size from children.
The question is how we respond to that case:

- Size containment would enforce
  that authors _always add an explicit size_,
  or the element cannot be queried.
- Pinky promise approach would allow the query
  but only return a size when it is explicitly set.

In either case,
we'll need to teach the concept
that queries rely on external sizing to be accurate.

Rune Lillesveen pushed that a bit further,
asking about containers _inside_ floats:

> I was thinking about the case
> where you have an auto-width block
> inside a float
> and other content that contributes to min/max widths.
> What's the width that a CQ on `#auto` evaluates against
> and when does that happen?
> Will that width possibly change multiple times during layout?:

```html
<!doctype html>
<style>
  #float { float: left }
  #auto { height: 200px; background: blue }
</style>
<div id="float">
  <div>YYYYYYYYYYYYY</div>
  <div id="auto"></div>
  XXXXXXXXXXXXXXXXXXXXX
</div>
```

To me this looks like the same basic problem,
unless there is something special about the timing issues?

#### How does it scale when nested?

From Eric again:

> How does “pretend it didn’t happen” scale
> when you have nested containers & queries?
> Do you pretend for each nested container in turn,
> (so you have to run layout the-max-nested-depth times, I think?),
> or do you pretend every queried container has contain set,
> all the way up the chain,
> once (so you’re “only” running layout twice,
> once for real and once for query resolving purposes?)

This is a question for someone
with more knowledge of browser rendering & layout internals.

According to Rune:

> This sounds like what would have happened
> if we fully finished layout for each container,
> re-evaluated container queries,
> then went back to style recalc,
> then layout for a container at the next level, etc.
> instead of calling style recalc from layout
> and continue in the same layout pass.

I think this reflects
some of their thinking about how to
"interleave style and layout" --
needs follow-up...
