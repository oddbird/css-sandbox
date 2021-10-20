---
title: Full Site Changelog
created: 2021-10-20
is_log: true
eleventyNavigation:
  key: changes
  title: Full Site Changelog
  parent: home
---

{% set changelog = collections.all | getChangelog %}

{% for date, changes in changelog | groupby('date') %}
## {{ date }}

{% for change in changes %}
- [{{ change.source }}]({{ change.url }}):
  _{{ change.log | trim }}_{% endfor %}
{% endfor %}
