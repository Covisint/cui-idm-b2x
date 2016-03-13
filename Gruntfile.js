module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig ({
    watch:{
      css:{
        files: 'assets/scss/**/*',
        tasks: ['sass','autoprefixer']
      },
      scripts:{
        files: ['assets/app/**/*.js'],
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
      dist: {
        src: ['assets/angular-modules/app.intro.js','assets/app/**/*.js','assets/angular-modules/app.outro.js'],
        dest: 'assets/concatJS/app.js'
      }
    },
    clean: {
      build: {
        src: ["build"]
      }
    },
    copy: {
      index: {
        src: 'index.html',
        dest: 'build/index.html'
      },
      appTemplates: {
        src: 'assets/app/**/*.html',
        dest: 'build/'
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
    }


  });


  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat','sass','autoprefixer','browserSync:dev','watch']);
  grunt.registerTask('build', ['sass','autoprefixer','concat','clean','copy','concat','useminPrepare','concat:generated','cssmin:generated','uglify:generated','filerev','usemin']);
  grunt.registerTask('demo', ['browserSync:demo']);
  grunt.registerTask('jslint', ['jshint']);
}
