module.exports = function(grunt,config){
    return {
        options: {
          browsers: ['last 3 versions']
        },
        dist: {
          files: {
            '<%= config.concatCssDir %>': '<%= config.concatCssDir %>'
          }
        }
    };
};