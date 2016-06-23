module.exports = function(grunt, config) {
  return {
    options: {
      singleQuotes: true
    },
    js: {
      files: {
        '<%= config.concatAppDir %>': '<%= config.concatAppDir %>'
      }
    }
  };
};
