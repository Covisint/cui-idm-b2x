module.exports = function(grunt,config){
    return {
        options: {
          assetsDirs: ['<%= config.buildDir %>']
        },
        css: ['<%= config.buildDir %>/app/css/**/*.css'],
        js: ['<%= config.buildDir %>/app/js/**/*.js'],
        html: ['<%= config.buildDir %>/index.html']
    }
};