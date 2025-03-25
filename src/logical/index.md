---
title: CSS Logical Shorthands
created: 2025-03-25
index: logical
---

The CSS Working Group recently resolved
to add a `size` shorthand
for setting both the `width` and `height` of an element.
Many people asked about using it to set the ‘logical’
`inline-size` and `block-size` properties instead.
But ‘logical shorthands’ have been
stalled in the working group for years.
_Can we get them unstuck?_

[You can support our efforts](https://opencollective.com/oddbird-open-source/contribute/css-logical-shorthands-86141)

## Next steps

1. Research what properties would be impacted
2. Choose syntax for individual properties
3. Develop lexical toggle to allow default-logical styles

## CSS Working Group discussion

- Specification: [CSS Logical Properties](https://www.w3.org/TR/css-logical/)

Fantasai opened the original issue in 2017,
when publishing the [First Public Working Draft](https://www.w3.org/TR/2017/WD-css-logical-1-20170518/)
of CSS Logical Properties:
[[css-logical] Flow-relative syntax for margin-like shorthands](https://github.com/w3c/csswg-drafts/issues/1282#issue-223656679).
Here are some key comments:

- [2021 proposed solution](https://github.com/w3c/csswg-drafts/issues/1282#issuecomment-952428897)
  by [Fantasai & Miriam & Jen Simmons](https://css.oddbird.net/elsewhere/21-brooklyn/)
- [2022 TPAC discussion](https://github.com/w3c/csswg-drafts/issues/1282#issuecomment-1249685175)
  with [Internationalization Working Group](https://www.w3.org/groups/wg/i18n-core/) (I18n) --
  [Tab summarizes the decision to be made](https://github.com/w3c/csswg-drafts/issues/1282#issuecomment-1249822796),
  but the next step is
  _making a list of impacted properties_
- [2023 update for I18n WG](https://github.com/w3c/csswg-drafts/issues/1282#issuecomment-1719113776) --
  _still waiting on the research_
- [2024 update for I18n WG](https://github.com/w3c/csswg-drafts/issues/1282#issuecomment-2372647118) --
  _still waiting on research_

## Other resources

- Jeremy Keith, 2022: [Let's get logical](https://adactio.com/journal/19457)
- Miriam, 2022: [A long-term plan for logical shorthands?](https://www.miriamsuzanne.com/2022/09/16/tpac-logical/)
- OddBird, 2025: [Support logical shorthands in CSS](https://www.oddbird.net/2025/03/20/logical-shorthand/)
