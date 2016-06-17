module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var config = {
    buildDir : './build',
    buildSdkDir : './build-sdk',
    concatAppDir: './assets/concat/js/app.js',
    concatCssDir: './assets/concat/css/main.css',
    modules: './app/modules',
    scss: './app/scss'
  };

  var tasks = ['watch','sass','browserSync','postcss','clean','copy','filerev','useminPrepare',
  'useminPreparesdk','usemin','useminsdk','uglify','jshint','ngtemplates','processhtml','babel','ngAnnotate'];

  var opts = {
    config:config
  };

  tasks.forEach(function(task) {
    opts[task] = require('./tasks/' + task + '.js')(grunt, config);
  });

  grunt.initConfig(opts);

  // Workaround for multiple useminPrepare tasks
  grunt.registerTask('useminPreparesdk', function() {
    var useminPreparesdkConfig = grunt.config('useminPreparesdk');
    grunt.config.set('useminPrepare', useminPreparesdkConfig);
    grunt.task.run('useminPrepare');
  });

  // Workaround for multiple usemin tasks
  grunt.registerTask('useminsdk', function() {
    var useminsdkConfig = grunt.config('useminsdk');
    grunt.config.set('usemin', useminsdkConfig);
    grunt.task.run('usemin');
  });

  grunt.registerTask('concatModules', 'Task to concat all project modules.', require('./tasks/concatModules.js')(grunt,config));


  // Tasks ------------------------------------------------------------
  grunt.registerTask('default', ['copy:dev','concatModules','babel','ngAnnotate','sass','postcss','browserSync:dev','watch']);

  grunt.registerTask('build', ['sass','postcss','processhtml','ngtemplates:build','clean:build','copy:build',
                                'concatModules','babel','ngAnnotate','useminPrepare','concat:generated',
                                'cssmin:generated','uglify:generated','filerev:build','usemin','clean:temp']);

  grunt.registerTask('buildsdk', ['sass','postcss','ngtemplates:buildsdk','clean:buildsdk','copy:buildsdk',
                                  'concatModules','babel','useminPreparesdk','concat:generated','cssmin:generated',
                                  'uglify:generated','filerev:buildsdk','useminsdk','clean:temp']);

  grunt.registerTask('demo', ['browserSync:demo']);
  grunt.registerTask('demosdk', ['browserSync:demosdk']);
  grunt.registerTask('jslint', ['jshint']);

};
