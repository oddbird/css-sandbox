---
title: Container Style Queries
created: 2022-10-25
eleventyNavigation:
  key: style-queries
  title: Container Style Queries
  parent: rwd
---

Style queries are a subset of 'container queries',
but rather than querying conditions of the _container size_,
we can query the _computed value_
of any CSS properties on the container.
This allows low-level enhancements,
such as applying non-font-style `em` styles
when the parent element is already italic:

```css
em {
  font-style: italic;

  @container style(font-style: italic) {
    background: powderblue;
  }
}
```

It could also be used to allow
[querying high level custom properties](https://github.com/w3c/csswg-drafts/issues/5624).
For example,
when the root color scheme changes
we can set a custom property,
and query the value
to adjust our components:

```css
html {
  --current-scheme: light;
  container-name: color-scheme;
  color-scheme: light dark;

  @media (prefers-color-scheme: dark) { --current-scheme: light; }
  /* value can also be updated by explicit user interface, if desired */
}

body {
  @container color-scheme (--current-scheme: light) {
    /* light mode tokens/styles */
  }

  @container color-scheme (--current-scheme: dark) {
    /* dark mode tokens/styles */
  }
}

.component { /* or `@scope (.component)` */
  @container color-scheme (--current-scheme: light) {
    /* light mode component tokens/styles */;
  }

  @container color-scheme (--current-scheme: dark) {
    /* dark mode component tokens/styles */;
  }
}
```

{% note %}
Nested at-rules are part of the CSS nesting syntax,
which is under active development.
The concept is the same if you remove that syntax sugar.
{% endnote %}

## My Notes

{{ collections.all | eleventyNavigation('style-queries') | eleventyNavigationToHtml | typogr | safe }}

## Specification

- [Editor's Draft](https://drafts.csswg.org/css-contain-3/)
- [Working Draft](https://www.w3.org/TR/css-contain-3/)

## Issues

- [Github Project](https://github.com/w3c/csswg-drafts/projects/18)
- [Github Contain-3 Label](https://github.com/w3c/csswg-drafts/issues?q=is%3Aopen+is%3Aissue+label%3Acss-contain-3)

## Support

No production support at this time.

## Implementations

- **Chromium** (Chrome/Edge 107+):

  - Navigate to `about://flags/#enable-experimental-web-platform-features`.
  - Set it to `Enabled`.
  - Restart the browser.
  - Currently _only supports queries of custom properties_

## Articles & Demos

- [CodePen Collection]()
- CSS-Tricks: [Early Days of Container Style Queries](https://css-tricks.com/early-days-of-container-style-queries/)
  by **Geoff Graham**
