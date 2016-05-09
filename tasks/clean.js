module.exports = function(grunt,config){
    return {
        build: {
          src: ['<%= config.buildDir %>']
        },
        buildsdk: {
          src: ['<%= config.buildSdkDir %>']
        },
        temp: {
          src: ['assets/processedHtml','.tmp','assets/concat/js/app.js.map','assets/concat/js/modules.js','assets/concat/js/templateCache.js']
        }
    };
};