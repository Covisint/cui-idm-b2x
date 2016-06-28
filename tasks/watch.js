module.exports = function(grunt,config){
  return {
    css:{
      files: config.scss + '/**/*',
      tasks: ['sass','postcss']
    },
    scripts:{
      files: ['app/**/*.js'],
      tasks: ['concatModules','babel','ngAnnotate'],
      options: {
        spawn: false,
      },
    }
  };
};