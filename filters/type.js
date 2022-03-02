'use strict';

const typogr = require('typogr');
const ghSlug = require('github-slugger').slug;

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

const note = (content, label) => {
  return `<aside data-alert="note">
            <strong>${label || 'Note'}:</strong>
            <div>${render(content.trim())}</div>
          </aside>`;
}

const warn = (content, label) => {
  return `<aside data-alert="warn">
            <strong>${label || 'Warning'}:</strong>
            <div>${render(content.trim())}</div>
          </aside>`;
}

module.exports = {
  mdown,
  amp,
  set,
  render,
  inline,
  warn,
  note,
};
