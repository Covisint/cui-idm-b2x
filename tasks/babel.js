module.exports = function(grunt,config){
  return {
    options: {
      sourceMap: true,
      presets: ['es2015'],
      retainLines: true,
      compact: true
    },
    babel: {
      files: {
        '<%= config.concatAppDir %>': '<%= config.concatAppDir %>'
      }
    }
  };
};