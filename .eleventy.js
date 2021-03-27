const nav = require("@11ty/eleventy-navigation");
const hljs = require('@11ty/eleventy-plugin-syntaxhighlight');
const toc = require('eleventy-plugin-toc');
const yaml = require('js-yaml');

const type = require('./filters/type');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(hljs);
  eleventyConfig.addPlugin(nav);
  eleventyConfig.addPlugin(toc);

  eleventyConfig.addWatchTarget("./src/sass/");
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/favicon.svg");

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

  return {
    markdownTemplateEngine: 'njk',
    dir: {
      input: "src",
      output: "public",
      layouts: '_layouts',
    },
  };
};
