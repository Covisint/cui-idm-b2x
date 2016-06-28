module.exports = function(grunt,config){
    return {
        options: {
          map: true, // inline sourcemaps
          processors: [
            require('autoprefixer')({browsers: 'last 3 versions'}), // add vendor prefixes
          ]
        },
        dist: {
          files: {
            '<%= config.concatCssDir %>': '<%= config.concatCssDir %>'
          }
        }
    };
};