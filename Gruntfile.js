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
        src: ["build"]
      }
    },
    copy: {
      appConfig:{
        src:'appConfig.json',
        dest:'build/appConfig.json'
      },
      index: {
        src: 'index.html',
        dest: 'build/index.html'
      },
      languageFiles: {
        src: 'bower_components/cui-i18n/dist/cui-i18n/angular-translate/*.json',
        dest: 'build/'
      },
      localeFiles: {
        src: 'bower_components/angular-i18n/*.js',
        dest: 'build/'
      },
      svgList: {
        src: 'bower_components/cui-icons/iconList',
        dest: 'build/'
      },
      svgs: {
        src: ['bower_components/cui-icons/dist/**/*.svg'],
        dest: 'build/'
      },
      countries: {
        src: ['bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/*.json'],
        dest: 'build/'
      },
      timezones: {
        src: ['bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/*.json'],
        dest: 'build/'
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
            removeStyleLinkAttributes: true,
          }
        }
      }
    }
  });

  grunt.registerTask('default', ['concat:dev','sass','autoprefixer','browserSync:dev','watch']);
  grunt.registerTask('build', ['sass','autoprefixer','ngtemplates','clean','copy','concat:build','useminPrepare','concat:generated','cssmin:generated','uglify:generated','filerev','usemin']);
  grunt.registerTask('demo', ['browserSync:demo']);
  grunt.registerTask('jslint', ['jshint']);
};
