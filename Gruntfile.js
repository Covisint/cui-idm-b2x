module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig ({
    watch:{
      css:{
        files: 'app/scss/**/*',
        tasks: ['sass','autoprefixer']
      },
      scripts:{
        files: ['app/**/*.js'],
        tasks: ['concatModules','babel'],
        options: {
          spawn: false,
        },
      }
    },

    sass:{
      dist:{
        files:{
          'assets/concat/css/main.css': 'app/scss/main.scss'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 3 versions']
      },
      dist: {
        files: {
          'assets/concat/css/main.css': 'assets/concat/css/main.css'
        }
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
            src : [
                '**/*.html',
                '**/*.js',
                '**/*.css'
            ]
        },
        options: {
          ghostMode: false,
          watchTask: true,
          online: true,
          port: 9001,
          server:{
            baseDir: './'
          }
        }
      },
      demo: {
        bsFiles: {
            src : [
                '**/*.html',
                '**/*.js',
                '**/*.css'
            ]
        },
        options: {
          ghostMode: false,
          watchTask: false,
          online: true,
          server:{
            baseDir: 'build/'
          }
        }
      },
      demosdk: {
        bsFiles: {
          src : [
            '**/*.html',
            '**/*.js',
            '**/*.css'
          ]
        },
        options: {
          ghostMode: false,
          watchTask: false,
          online: true,
          server: {
            baseDir: 'build-sdk/'
          }
        }
      }
    },

    concat: {
      options: {
        separator: '\n\n'
      },
      build: {
        src: ['app/angular-modules/app.intro.js','app/angular-modules/templateCache.js','app/app/**/*.js','app/angular-modules/app.outro.js'],
        dest: 'app/concatJS/app.js'
      },
      dev: {
        src: [ 'app/_ajax.cache.js', 'app/angular-modules/app.intro.js','app/app/**/*.js','app/angular-modules/app.outro.js'],
        dest: 'app/concatJS/app.js'
      },
    },

    clean: {
      build: {
        src: ['build']
      },
      buildsdk: {
        src: ['build-sdk']
      },
      temp: {
        src: ['assets/processedHtml','.tmp','assets/concat/js/app.js.map','assets/concat/js/modules.js','assets/concat/js/templateCache.js']
      }
    },

    copy: {
      build: {
        files: [
          {
            src: 'index.html',
            dest: 'build/index.html'
          }, {
            src: [
              'bower_components/cui-i18n/dist/cui-i18n/angular-translate/*.json',
              'bower_components/angular-i18n/*.js',
              'bower_components/cui-icons/iconList',
              'bower_components/cui-icons/dist/**/*.svg',
              'bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/*.json',
              'bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/*.json'
            ],
            dest: 'build/'
          }
        ]
      },
      buildsdk: {
        files: [
          {
            src: 'index.html',
            dest: 'build-sdk/index.html'
          }, {
            src: [
              'bower_components/cui-i18n/dist/cui-i18n/angular-translate/*.json',
              'bower_components/angular-i18n/*.js',
              'bower_components/cui-icons/iconList',
              'bower_components/cui-icons/dist/**/*.svg',
              'bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/*.json',
              'bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/*.json'
            ],
            dest: 'build-sdk/'
          }
        ]
      },
      dev: {
        src: 'appConfig-example.json',
        dest: 'appConfig.json'
      }
    },

    filerev: {
      build: {
        src: ['build/app/css/main.css','build/app/js/vendor.js','build/app/js/app.js']
      },
      buildsdk: {
        src: ['build-sdk/app/css/main.css','build-sdk/app/js/vendor.js','build-sdk/app/js/app.js']
      }
    },

    useminPrepare: {
      html: 'index.html',
      options: {
        src: './',
        dest: './build'
      }
    },

    useminPreparesdk: {
      html: './index.html',
      options: {
        src: './',
        dest: './build-sdk'
      }
    },

    usemin: {
      options: {
        assetsDirs: ['./build']
      },
      css: ['./build/app/css/**/*.css'],
      js: ['./build/app/js/**/*.js'],
      html: ['./build/index.html']
    },

    useminsdk: {
      options: {
        assetsDirs: ['./build-sdk']
      },
      css: ['./build-sdk/app/css/**/*.css'],
      js: ['./build-sdk/app/app/**/*.js'],
      html: ['./build-sdk/index.html']
    },

    uglify: {
      options: {
        mangle: false
      }
    },

    jshint: {
      app: ['app/**/*.js']
    },

    ngtemplates: {
      build: {
        src: 'assets/processedHtml/**/*.html',
        dest: 'assets/concat/js/templateCache.js',
        options: {
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhiteSpace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeReduntantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkAttributes: true
          },
          module: 'app',
          url: function(url) { return url.replace('assets/processedHtml/', ''); }
        }
      },
      buildsdk: {
        src: ['app/modules/**/*.html','app/common-templates/**/*.html'],
        dest: 'assets/concat/js/templateCache.js',
        options: {
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhiteSpace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeReduntantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkAttributes: true
          },
          module: 'app'
        }
      }
    },

    processhtml: {
      build: {
        options: {
          commentMarker: 'processHTML'
        },
        files: [{
          expand: true,
          cwd: './',
          src: ['app/modules/**/**.html', 'app/common-templates/**/*.html'],
          dest: 'assets/processedHtml/',
          extDot: '.html'
        }]
      }
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
        retainLines: true,
        compact: true
      },
      babel: {
        files: {
          'assets/concat/js/app.js': 'assets/concat/js/app.js'
        }
      }
    }
  });

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

  grunt.registerTask('concatModules', 'Task to concat all project modules.', function() {
    var angularModules = [],
        sourceArray = [];

    // Get all angular-modules directories and push them into angularModules array
    grunt.file.expand('app/modules/*').forEach(function(dir) {
      angularModules.push(dir.substr(dir.lastIndexOf('/')+1));
    });

    // Get concat object from initConfig
    var concat = grunt.config.get('concat') || {};

    // Create  array of all module sources
    angularModules.forEach(function(module) {
      if (module !== 'jsWrapper') {
        if (module !== 'app') {
          var fileNames=[];
          grunt.file.expand('app/modules/' + module + '/**/*.js').forEach(function(file) {
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
                                            'app/modules/' + module + '/**/*.js',
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
      dest: 'assets/concat/js/app.js'
    };

    // Add new subtasks to concat in initConfig
    grunt.config.set('concat', concat);

    // Run creates tasks
    grunt.task.run('concat:modules');
    grunt.task.run('concat:wrapModules');
  });


  // Tasks ------------------------------------------------------------
  grunt.registerTask('default', ['copy:dev','concatModules','babel','sass','autoprefixer','browserSync:dev','watch']);

  grunt.registerTask('build', ['sass','autoprefixer','processhtml','ngtemplates:build','clean:build','copy:build',
                                'concatModules','babel','useminPrepare','concat:generated',
                                'cssmin:generated','uglify:generated','filerev:build','usemin','clean:temp']);

  grunt.registerTask('buildsdk', ['sass','autoprefixer','ngtemplates:buildsdk','clean:buildsdk','copy:buildsdk',
                                  'concatModules','babel','useminPreparesdk','concat:generated','cssmin:generated',
                                  'uglify:generated','filerev:buildsdk','useminsdk','clean:temp']);

  grunt.registerTask('demo', ['browserSync:demo']);
  grunt.registerTask('demosdk', ['browserSync:demosdk']);
  grunt.registerTask('jslint', ['jshint']);

};
