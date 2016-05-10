module.exports = function(grunt,config) {
  return function(){
    var angularModules = [],
        sourceArray = [];

    // Get all angular-modules directories and push them into angularModules array
    grunt.file.expand(config.modules + '/*').forEach(function(dir) {
      angularModules.push(dir.substr(dir.lastIndexOf('/')+1));
    });

    // Get concat object from initConfig
    var concat = {};

    // Create  array of all module sources
    angularModules.forEach(function(module) {
      if (module !== 'jsWrapper') {
        if (module !== 'app') {
          var fileNames=[];
          grunt.file.expand(config.modules + '/' + module + '/**/*.js').forEach(function(file) {
            if(file.indexOf('.module') > -1) {
              fileNames = [file].concat(fileNames);
            }
            else {
              fileNames.push(file);
            }
          });
          sourceArray = fileNames.concat(sourceArray);
        }
        else {
          // Concat 'app' module last
          sourceArray = sourceArray.concat(['app/wrappers/' + module + '/' + module + '.intro.js',
                                            config.modules + '/' + module + '/**/*.js',
                                            'assets/concat/js/templateCache.js',
                                            'app/wrappers/' + module + '/' + module + '.outro.js']);
        }
      }
    });

    // Task: concat modules into one file
    concat['modules'] = {
      src: sourceArray,
      dest: 'assets/concat/js/modules.js'
    };

    // Task: wrap modules.js with jsWrapper module
    concat['wrapModules'] = {
      src: ['app/wrappers/jsWrapper/jsWrapper.intro.js',
            'assets/concat/js/modules.js',
            'app/wrappers/jsWrapper/jsWrapper.outro.js'],
      dest: config.concatAppDir
    };

    // Add new subtasks to concat in initConfig
    grunt.config.set('concat', concat);

    // Run creates tasks
    grunt.task.run('concat:modules');
    grunt.task.run('concat:wrapModules');
  };
};