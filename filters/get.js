const getDate = (page) => page.data.changes
  ? page.data.changes.sort((a, b) => b.time - a.time).at(0).time
  : page.data.draft || page.data.created || page.date;

const byDate = (collection) => collection
  .sort((a, b) => getDate(b) - getDate(a));

const latest = (collection) => {
  return getDate(byDate(collection).at(0));
};

const noSelf = (collection, self) =>
  collection.filter((page) => page.url !== self.url);

const getIndex = (collection, tag) =>
  collection.find((page) => page.data.index === tag);

const getPage = (collection, page) =>
  collection.find((item) => item.url === page.url);

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter('getDate', getDate);
  eleventyConfig.addFilter('byDate', byDate);
  eleventyConfig.addFilter('latest', latest);
  eleventyConfig.addFilter('noSelf', noSelf);
  eleventyConfig.addFilter('getIndex', getIndex);
  eleventyConfig.addFilter('getPage', getPage);

  eleventyConfig.addCollection("index", function(collectionApi) {
    const collect = collectionApi
      .getAll()
      .filter((page) => page.data.index);

    return byDate(collect);
  });
};
