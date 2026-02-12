module.exports = function (eleventyConfig) {
  // Filters
  eleventyConfig.addFilter("slugify", (str = "") =>
    String(str)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );

  // Static assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/downloads": "downloads" });

  // Collections
  eleventyConfig.addCollection("jobs", (collection) => {
    return collection
      .getFilteredByGlob("src/jobs/*.md")
      .sort((a, b) => (b.page.date ?? 0) - (a.page.date ?? 0));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
