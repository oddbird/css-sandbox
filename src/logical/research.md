---
title: Scattered notes & side quests
draft: 2025-03-25
---

## Why `inline-size` but `padding-inline`?

This is a question from
[@johanwestling on Mastodon](https://mastodon.social/@johanwestling/114220721222033597):

> But why the opposite property naming order?
> I mean `padding`, `padding-block`, `padding-inline` for example.

I wasn't in the CSS Working Group
when this decision was made,
but here's what I've found so far.

- March 2014
  Writing-Modes spec defines terms
  `extent` (block) & `measure` (inline):
  https://www.w3.org/TR/2014/CR-css-writing-modes-3-20140320/#abstract-dimensions
- March 2014
  CSSWG resolves to use
  `inline-(something)` and `block-(something)` instead:
  https://lists.w3.org/Archives/Public/www-style/2014Mar/0255.html
- March 2014 The discussion is mostly about
  what `(something)` should be,
  and agreeing that a hyphen makes
  `block-size` more clear than `block size`
  (the 2D size of a block?):
  https://lists.w3.org/Archives/Public/www-style/2014Mar/0479.html
- July 2014 first commit to Logical Properties spec
  includes `length` and `measure` as the property names:
  https://github.com/w3c/csswg-drafts/blob/156b081188738ea7ecd1aa6a168e4347d339b19f/css-logical-props/Overview.bs
- October 2014 the properties are updated to
  `inline-size` and `block-size`:
  https://github.com/w3c/csswg-drafts/commit/0a24110043cb3f3033fb22661297046a54465eda
- December 2015
  Writing Modes spec uses `inline-size` and `block-size`: https://www.w3.org/TR/2015/CR-css-writing-modes-3-20151215/#abstract-axes
- May 2017
  First Public Working Draft of Logical Properties:
  https://www.w3.org/TR/2017/WD-css-logical-1-20170518/

[Github issues only go back to late 2015](https://github.com/w3c/csswg-drafts/issues?q=is%3Aissue%20&page=377),
after the names seem to be settled,
so I can't find any discussion there.
