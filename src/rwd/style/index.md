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
For example, when the container has a dark background,
we can set our links to a lighter color:

```css
html,
.colors-dark,
.colors-light {
  container-name: color-scheme;
}

@container color-scheme (background: black) {
  a:any-link {
    color: powderblue;
  }
}
```

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
