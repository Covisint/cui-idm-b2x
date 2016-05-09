module.exports = function(grunt,config){
    return {
        options: {
          assetsDirs: ['<%= config.buildSdkDir %>']
        },
        css: ['<%= config.buildSdkDir %>/app/css/**/*.css'],
        js: ['<%= config.buildSdkDir %>/app/js/**/*.js'],
        html: ['<%= config.buildSdkDir %>/index.html']
    };
};