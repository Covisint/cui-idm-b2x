module.exports = function(grunt,config){
  return {
    build: {
      src: ['<%= config.buildDir %>/app/css/main.css','<%= config.buildDir %>/app/js/vendor.js','<%= config.buildDir %>/app/js/app.js']
    },
    buildsdk: {
      src: ['<%= config.buildSdkDir %>/app/css/main.css','<%= config.buildSdkDir %>/app/js/vendor.js','<%= config.buildSdkDir %>/app/js/app.js']
    }
  };
};