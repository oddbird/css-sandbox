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

const note = (content, label, close) => {
  return `<details data-alert="note" ${close ? '' : 'open'}>
            <summary>${label || 'Note'}:</summary>
            <div>${render(content.trim())}</div>
          </details>`;
}

const warn = (content, label, close) => {
  return `<details data-alert="warn" ${close ? '' : 'open'}>
            <summary>${label || 'Warning'}:</summary>
            <div>${render(content.trim())}</div>
          </details>`;
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
