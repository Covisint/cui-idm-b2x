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
      }
    },
    concat: {
      options: {
           separator: '\n\n',
      },
      build:{
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
      processedHtml: {
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
              'bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/*.json',
            ],
            dest: 'build/'
          }
        ]
      },
      dev: {
        src:'appConfig-example.json',
        dest:'appConfig.json'
      }
    },
    filerev:{
      dist:{
        src:['build/assets/css/main.css','build/assets/js/vendor.js','build/assets/js/app.js']
      }
    },
    useminPrepare: {
      html: './index.html',
      options: {
        src: './',
        dest: './build'
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
    uglify: {
      options: {
        mangle: false
      }
    },
    jshint: {
      app: ['assets/**/*.js']
    },
    ngtemplates: {
      app: {
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
      },
      prod: {
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
      }
    },
    processhtml: {
      prodBuild: {
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
    }
  });

  grunt.registerTask('default', ['copy:dev','concat:dev','sass','autoprefixer','browserSync:dev','watch']);
  grunt.registerTask('build', ['sass','autoprefixer','ngtemplates:app','clean:build','copy:build','concat:build','useminPrepare','concat:generated','cssmin:generated','uglify:generated','filerev','usemin']);
  grunt.registerTask('buildProd', ['sass','autoprefixer','processhtml:prodBuild','ngtemplates:prod','clean:build','copy:build','concat:build','useminPrepare','concat:generated','cssmin:generated','uglify:generated','filerev','usemin','clean:processedHtml']);
  grunt.registerTask('demo', ['browserSync:demo']);
  grunt.registerTask('jslint', ['jshint']);

};
