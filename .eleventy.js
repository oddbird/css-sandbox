const nav = require('@11ty/eleventy-navigation');
const hljs = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const toc = require('eleventy-plugin-toc');
const yaml = require('js-yaml');

const type = require('./filters/type');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(hljs);
  eleventyConfig.addPlugin(nav);
  eleventyConfig.addPlugin(toc);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addWatchTarget('./src/sass/');
  eleventyConfig.addPassthroughCopy('./src/css');
  eleventyConfig.addPassthroughCopy('./src/favicon.svg');

  // filters
  eleventyConfig.addFilter('amp', type.amp);
  eleventyConfig.addFilter('typogr', type.set);
  eleventyConfig.addFilter('md', type.render);
  eleventyConfig.addFilter('mdInline', type.inline);

  // config
  eleventyConfig.setLibrary('md', type.mdown);
  eleventyConfig.addDataExtension('yaml', yaml.safeLoad);
  eleventyConfig.setQuietMode(true);
  eleventyConfig.setDataDeepMerge(true);

  // shortcodes
  eleventyConfig.addPairedShortcode('md', type.render);
  eleventyConfig.addPairedShortcode('mdInline', type.inline);
  eleventyConfig.addPairedShortcode('typogr', type.set);

  eleventyConfig.addCollection("changes", function(collectionApi) {
    const all = collectionApi.getAll();
    const changes = [];

    all.forEach((post) => {
      if (post.data.changes) {
        post.data.changes
          .sort((a, b) => b.time - a.time)
          .forEach((change, i) => {
            changes.push({
              post,
              date: change.time,
              log: change.log,
              latest: i === 0,
            });
          });
      }

      changes.push({
        post,
        date: post.data.created || post.date,
        log: 'New page added',
        latest: post.data.changes ? false : true,
      });
    });

    return changes.sort((a, b) => b.date - a.date);
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
