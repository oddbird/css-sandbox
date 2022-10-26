---
eleventyExcludeFromCollections: true
title: Redirecting
pagination:
  data: redirects
  size: 1
  alias: redirect
permalink: '{{ redirect.from }}'
---

Redirecting you to
[{{ redirect.to }}]({{ redirect.to }}).
If you are not redirected shortly, follow the link.
