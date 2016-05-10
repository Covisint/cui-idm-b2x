module.exports = function(grunt,config){
  return {
    css:{
      files: config.scss + '/**/*',
      tasks: ['sass','autoprefixer']
    },
    scripts:{
      files: ['app/**/*.js'],
      tasks: ['concatModules','babel'],
      options: {
        spawn: false,
      },
    }
  };
};