module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  const path = require('path');
  const YAML = require('yamljs');

  // Load the package.json file to have its variables available
  var pkgJson = require('./package.json');
  const appName = pkgJson.name.split('/').pop();
  const dtStamp = grunt.template.today('yyyymmddhhMMss');

    // look for a target specified in the command line, otherwise assume 'local'
    const target = (typeof grunt.option('target') === 'undefined') ? 'local' : grunt.option('target');
    const buildArtifact = appName + '-' + pkgJson.version + '-' + target + '-' + dtStamp + '.zip';

    // load the secrets profile file from your home directory
    const envPath = path.join(process.env['HOME'],'.cui/profiles',appName,target);

    //if the envPath does not exist, create it
    if (!grunt.file.exists(envPath)) {

      var emptyEnv = {
        clientId,
        clientSecret,
        originUri,
        uiHost,
        serviceUrl,
        solutionInstancesUrl
      };

      grunt.log.writeln('Creating a profile for you to store secrets.');
      grunt.file.write(envPath, YAML.stringify(emptyEnv));
      grunt.log.writeln('An empty profile has been created for you at: ' + envPath);

    }

    // now that we know it exists, we can read it, but trap it just in case
    var env = grunt.file.readYAML(envPath);

    var clientId = (typeof grunt.option('clientId') === 'undefined') ? env.clientId : grunt.option('clientId');
    var clientSecret = (typeof grunt.option('clientSecret') === 'undefined') ? env.clientSecret : grunt.option('clientSecret');
    var originUri = (typeof grunt.option('originUri') === 'undefined') ? env.originUri : grunt.option('originUri');
    var uiHost = (typeof grunt.option('uiHost') === 'undefined') ? env.uiHost : grunt.option('uiHost');
    var serviceUrl = (typeof grunt.option('serviceUrl') === 'undefined') ? env.serviceUrl : grunt.option('serviceUrl');
    var solutionInstancesUrl = (typeof grunt.option('solutionInstancesUrl') === 'undefined') ? env.solutionInstancesUrl : grunt.option('solutionInstancesUrl');

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
      name: appName,
      userHomeDir: process.env['HOME'],
      clientId: clientId,
      clientSecret: clientSecret,
      originUri: originUri,
      uiHost: uiHost,
      buildArtifact: buildArtifact,
      serviceUrl: serviceUrl,
      solutionInstancesUrl: solutionInstancesUrl
    };

    // now build the appConfig-env.json
    var appConfigEnv = {
      originUri: config.originUri,
      serviceUrl: config.serviceUrl,
      solutionInstancesUrl: config.solutionInstancesUrl
    };
    grunt.file.write('appConfig-env.json', JSON.stringify(appConfigEnv));

    // now build the appConfig-build.json
    var appConfigBuild = {
      app: appName,
      version: config.version,
      target: config.target,
      buildDate: grunt.template.today('yyyymmddhhMMss'),
      buildArtifact: config.buildArtifact
    };

    grunt.file.write('appConfig-build.json', JSON.stringify(appConfigBuild));

  var tasks = ['watch','sass','browserSync','postcss','clean','compress','copy','filerev','useminPrepare',
  'useminPreparesdk','usemin','useminsdk','uglify','jshint','ngtemplates','processhtml','babel','ngAnnotate',
  'http_upload'];

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

  grunt.registerTask('concatModules', 'Task to concat all project modules.',
    require('./tasks/concatModules.js')(grunt,config));

  // Tasks ------------------------------------------------------------
  grunt.registerTask('default', ['concatModules','babel','ngAnnotate','sass','postcss','browserSync:dev','watch']);

  grunt.registerTask('build', ['sass','postcss','processhtml','ngtemplates:build','clean:build','copy:build',
                                'concatModules','babel','ngAnnotate','useminPrepare','concat:generated',
                                'cssmin:generated','uglify:generated','filerev:build','usemin','clean:temp']);

  grunt.registerTask('buildsdk', ['sass','postcss','ngtemplates:buildsdk','clean:buildsdk','copy:buildsdk',
                                  'concatModules','babel','useminPreparesdk','concat:generated','cssmin:generated',
                                  'uglify:generated','filerev:buildsdk','useminsdk','clean:temp']);

  grunt.registerTask('demo', ['browserSync:demo']);

  grunt.registerTask('demosdk', ['browserSync:demosdk']);

  grunt.registerTask('jslint', ['jshint']);

  grunt.registerTask('package', ['build','compress']);

  grunt.registerTask('deploy', ['build','compress','http_upload:build']);

};
