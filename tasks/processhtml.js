module.exports = function(grunt,config){
  return {
    build: {
      options: {
        commentMarker: 'processHTML'
      },
      files: [{
        expand: true,
        cwd: './',
        src: ['<%= config.modules %>/**/**.html', 'app/common-templates/**/*.html'],
        dest: 'assets/processedHtml/',
        extDot: '.html'
      }]
    }
  };
};