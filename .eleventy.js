const nav = require('@11ty/eleventy-navigation');
const hljs = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const toc = require('eleventy-plugin-toc');
const yaml = require('js-yaml');
const ghSlug = require('github-slugger').slug;

const time = require('./filters/time');
const type = require('./filters/type');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(hljs);
  eleventyConfig.addPlugin(nav);
  eleventyConfig.addPlugin(toc);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addWatchTarget('./src/styles/');
  eleventyConfig.addPassthroughCopy('./src/css');
  eleventyConfig.addPassthroughCopy('./src/favicon.svg');

  // filters
  eleventyConfig.addFilter('amp', type.amp);
  eleventyConfig.addFilter('typogr', type.set);
  eleventyConfig.addFilter('md', type.render);
  eleventyConfig.addFilter('mdInline', type.inline);

  eleventyConfig.addFilter('date', time.date);

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('slice', (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // config
  eleventyConfig.setLibrary('md', type.mdown);
  eleventyConfig.addDataExtension('yaml', yaml.safeLoad);
  eleventyConfig.setQuietMode(true);
  eleventyConfig.setDataDeepMerge(true);

  // shortcodes
  eleventyConfig.addPairedShortcode('md', type.render);
  eleventyConfig.addPairedShortcode('mdInline', type.inline);
  eleventyConfig.addPairedShortcode('typogr', type.set);
  eleventyConfig.addPairedShortcode('note', type.note);
  eleventyConfig.addPairedShortcode('warn', type.warn);

  eleventyConfig.addCollection("changes", function(collectionApi) {
    const all = collectionApi.getAll();
    const changes = [];

    all.forEach((post) => {
      if (post.data.changes) {
        post.data.changes
          .sort((a, b) => b.time - a.time)
          .forEach((change, i) => {
            const date = change.time;
            changes.push({
              post,
              date,
              url: post.url,
              log: change.log,
              latest: i === 0,
            });
          });
      }

      if (!post.data.draft) {
        const date = post.data.created || post.date;
        changes.push({
          post,
          date,
          log: 'New page added',
          latest: post.data.changes ? false : true,
          creation: true,
        });
      }
    });

    return changes.map((item) => {
      item.url = `/changelog${item.post.url}${ghSlug(time.date(item.date, 'iso'))}/`;
      item.date_group = time.date(item.date, 'long');
      return item;
    }).sort((a, b) => b.date - a.date);
  });

  return {
    markdownTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'public',
      layouts: '_layouts',
    },
  };
};
