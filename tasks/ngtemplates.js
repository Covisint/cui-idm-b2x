var htmlminOptions = {
  collapseBooleanAttributes: true,
  collapseWhiteSpace: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeReduntantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkAttributes: true
};

module.exports = function(grunt,config){
  return {
    build: {
      src: 'assets/processedHtml/**/*.html',
      dest: 'assets/concat/js/templateCache.js',
      options: {
        htmlmin: htmlminOptions,
        module: 'app',
        url: function(url) { return url.replace('assets/processedHtml/', ''); }
      }
    },
    buildsdk: {
      src: ['< config.modules %>/**/*.html','app/common-templates/**/*.html'],
      dest: 'assets/concat/js/templateCache.js',
      options: {
        htmlmin: htmlminOptions,
        module: 'app'
      }
    }
  };
};