module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig ({
    watch:{
      css:{
        files: 'assets/scss/**/*',
        tasks: ['sass','autoprefixer']
      },
      scripts:{
        files: ['assets/app/**/*.js','assets/angular-modules/**/*.js'],
        tasks: ['concat'],
        options: {
          spawn: false,
        },
      }
    },

    sass:{
      dist:{
        files:{
          'assets/css/main.css': 'assets/scss/main.scss'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 3 versions']
      },
      dist: {
        files: {
          'assets/css/main.css': 'assets/css/main.css'
        }
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
            src : [
                '**/*.html',
                'assets/concatJS/**/*.js',
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
        src: ['assets/angular-modules/app.intro.js','assets/angular-modules/templateCache.js','assets/app/**/*.js','assets/angular-modules/app.outro.js'],
        dest: 'assets/concatJS/app.js'
      },
      dev: {
        src: [ 'assets/_ajax.cache.js', 'assets/angular-modules/app.intro.js','assets/app/**/*.js','assets/angular-modules/app.outro.js'],
        dest: 'assets/concatJS/app.js'
      }
    },

    clean: {
      build: {
        src: ['build']
      },
      buildsdk: {
        src: ['build-sdk']
      },
      processhtml: {
        src: ['assets/angular-modules/processedHtml']
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
        src: ['build/assets/css/main.css','build/assets/js/vendor.js','build/assets/js/app.js']
      },
      buildsdk: {
        src: ['build-sdk/assets/css/main.css','build-sdk/assets/js/vendor.js','build-sdk/assets/js/app.js']
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
      css: ['./build/assets/css/**/*.css'],
      js: ['./build/assets/app/**/*.js'],
      html: ['./build/index.html']
    },

    useminsdk: {
      options: {
        assetsDirs: ['./build-sdk']
      },
      css: ['./build-sdk/assets/css/**/*.css'],
      js: ['./build-sdk/assets/app/**/*.js'],
      html: ['./build-sdk/index.html']
    },

    uglify: {
      options: {
        mangle: false
      }
    },

    jshint: {
      app: ['assets/**/*.js']
    },

    ngtemplates: {
      build: {
        src: 'assets/angular-modules/processedHtml/assets/app/**/*.html',
        dest: 'assets/angular-modules/templateCache.js',
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
          url: function(url) { return url.replace('assets/angular-modules/processedHtml/', ''); }
        }
      },
      buildsdk: {
        src: 'assets/app/**/*.html',
        dest: 'assets/angular-modules/templateCache.js',
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
          src: ['assets/app/**/**.html'],
          dest: 'assets/angular-modules/processedHtml/',
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
          'assets/concatJS/app.js': 'assets/concatJS/app.js'
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

  // Default task for development
  grunt.registerTask('default', ['copy:dev','concat:dev','babel','sass','autoprefixer','browserSync:dev','watch']);

  // Clean build
  grunt.registerTask('build', ['sass','autoprefixer','processhtml:build','ngtemplates:build','clean:build','copy:build',
                                'concat:build','babel','useminPrepare','concat:generated','cssmin:generated',
                                'uglify:generated','filerev:build','usemin','clean:processhtml']);

  // Build with comments referencing documentation and code
  grunt.registerTask('buildsdk', ['sass','autoprefixer','ngtemplates:buildsdk','clean:buildsdk','copy:buildsdk',
                                  'concat:build','babel','useminPreparesdk','concat:generated','cssmin:generated',
                                  'uglify:generated','filerev:buildsdk','useminsdk']);

  // Run project from demo/demosdk folders
  grunt.registerTask('demo', ['browserSync:demo']);
  grunt.registerTask('demosdk', ['browserSync:demosdk']);

  grunt.registerTask('jslint', ['jshint']);

};
