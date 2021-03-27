'use strict';

const typogr = require('typogr');
const ghSlugger = require('github-slugger');
const slugger = new ghSlugger();

const ghSlug = s => slugger.slug(s);

const mdown = require('markdown-it')({
  html: true,
  breaks: false,
  linkify: true,
  typographer: true,
})
  .disable('code')
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-anchor'), {
    slugify: ghSlug,
    permalink: true,
  });

const amp = (s) => {
  const r = '<span class="amp">&</span>';
  return s ? s.replace(/&amp;/g, '&').replace(/&/g, r) : s;
};

const set = (content) => (content ? typogr.typogrify(content) : content);
const render = (content, type = true) =>
  type ? set(mdown.render(content)) : mdown.render(content);
const inline = (content, type = true) =>
  type ? set(mdown.renderInline(content)) : mdown.renderInline(content);

module.exports = {
  mdown,
  amp,
  set,
  render,
  inline,
};
