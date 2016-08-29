module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // Load the package.json file to have its variables available
  var pkgJson = require('./package.json');
  const projectName = pkgJson.name.split('/').pop();

  // look for a target specified in the command line, otherwise assume 'local'
  const target = (typeof grunt.option('target') === 'undefined') ? 'local' : grunt.option('target');
  const buildArtifact = projectName + '-' + pkgJson.version + '-' + target + '-' + grunt.template.today('yyyymmddhhMMss') + '.zip'

  // load the secrets profile file from your home directory
  const envPath = process.env['HOME'] + '/.cui/profiles/' + projectName + '/' + target
  var env = grunt.file.readYAML(envPath);

  const clientId = (typeof grunt.option('clientId') === 'undefined') ? env.clientId : grunt.option('clientId');
  const clientSecret = (typeof grunt.option('clientSecret') === 'undefined') ? env.clientSecret : grunt.option('clientSecret');
  const originUri = (typeof grunt.option('originUri') === 'undefined') ? env.originUri : grunt.option('originUri');
  const uiHost = (typeof grunt.option('uiHost') === 'undefined') ? env.uiHost : grunt.option('uiHost');

  var config = {
    buildDir : './build',
    buildSdkDir : './build-sdk',
    artifactDir : './build-artifacts',
    concatAppDir: './assets/concat/js/app.js',
    concatCssDir: './assets/concat/css/main.css',
    modules: './app/modules',
    scss: './app/scss',
    target: target,
    version: pkgJson.version,
    name: projectName,
    userHomeDir: process.env['HOME'],
    clientId: clientId,
    clientSecret: clientSecret,
    originUri: originUri,
    uiHost: uiHost,
    buildArtifact: buildArtifact
  };


  console.log(config)

  var tasks = ['watch','sass','browserSync','postcss','clean','compress','copy','filerev','useminPrepare',
  'useminPreparesdk','usemin','useminsdk','uglify','jshint','ngtemplates','processhtml','babel','ngAnnotate','http_upload'];

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

  grunt.registerTask('package', ['build','copy:appConfig','compress']);

  grunt.registerTask('deploy', ['build','copy:appConfig','compress','http_upload:build'])

};
