const getDate = (page) => page.data.changes
  ? page.data.changes.sort((a, b) => b.time - a.time).at(0).time
  : page.data.draft || page.data.created || page.date;

const upDated = (page) => {
  page.date = getDate(page);
  return page;
}

const byDate = (collection) => collection
  .map((page) => upDated(page))
  .sort((a, b) => b.date - a.date);

const latest = (collection) => {
  return byDate(collection)[0].date;
};

const noSelf = (collection, self) =>
  collection.filter((page) => page.url !== self.url);

const byStatus = (collection) => {
  const draft = [];
  const active = [];
  const archive = [];

  byDate(collection).forEach(page => {
    if (page.data.archive) {
      archive.push(page);
    } else if (page.data.draft) {
      draft.push(page);
    } else {
      active.push(page);
    }
  });

  return {
    draft, active, archive,
  }
}

const getStatus = (collection, status) => byStatus(collection)[status];

const getIndex = (collection, tag) =>
  collection.find((page) => page.data.index === tag);

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter('getDate', getDate);
  eleventyConfig.addFilter('upDated', upDated);
  eleventyConfig.addFilter('byDate', byDate);
  eleventyConfig.addFilter('latest', latest);
  eleventyConfig.addFilter('noSelf', noSelf);
  eleventyConfig.addFilter('byStatus', byStatus);
  eleventyConfig.addFilter('getStatus', getStatus);
  eleventyConfig.addFilter('getIndex', getIndex);

  eleventyConfig.addCollection("index", function(collectionApi) {
    const collect = collectionApi
      .getAll()
      .filter((page) => page.data.index);

    return byDate(collect);
  });
};
