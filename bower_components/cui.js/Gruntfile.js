module.exports = function(grunt) {

  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: "\n\n"
      },
      dist: {
        src: [
          'src/_intro.js',
          'src/main.js',
          'src/util.js',
          'src/api.js',
          'src/web.js',
          'src/_outro.js'
        ],
        dest: 'dist/<%= pkg.name.replace(".js", "") %>.js'
      }
    },

    // Copies files to places other tasks can use
    copy: {
      demo: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'dist',
            dest: 'demo/lib',
            src: [ '*.js' ]
          },
          {
            expand: true,
            dot: true,
            cwd: 'bower_components/jquery/dist',
            dest: 'demo/lib',
            src: ['*.min.js']
          },
          {
            expand: true,
            dot: true,
            cwd: 'bower_components/table-to-json/lib',
            dest: 'demo/lib',
            src: ['*.min.js']
          },
          {
            expand: true,
            dot: true,
            cwd: 'bower_components/lodash',
            dest: 'demo/lib',
            src: ['*.min.js']
          }
        ]
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name.replace(".js", "") %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name.replace(".js", "") %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    qunit: {
      files: ['test/*.html']
    },

    jasmine : {
      src: 'dist/cui.js',
      options: {
        specs: 'spec/**/*.js',
        vendor: 'node_modules/jquery/dist/jquery.min.js'
      }
    },

    jshint: {
      files: [
        'dist/cui.js',
        'demo/scripts/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      }
    },

    connect: {
      options: {
        // NB avoid collisions...
        //port: 9000,
        //livereload: 35729,
        port: 9001,
        livereload: 35730,
        // Change this to '0.0.0.0' to access the server from outside.
        //hostname: 'localhost',
        hostname: '0.0.0.0',
        base: 'demo'
      },
      livereload: {
        options: {
          open: true
        }
      }
    },

    watch: {
      js: {
        files: ['src/**/*.js'],
        tasks: ['concat','copy'],
      },
      demo: {
        files: [
          'demo/styles/*.css',
          'demo/scripts/*.js',
          'demo/*.html'
        ],
        tasks: ['jshint'],
      },
      dist: {
        files: ['dist/**/*.js'],
        tasks: ['jshint', 'qunit'],
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
          //livereload: true
        },
        files: [
          '<%= jshint.files %>',
          'demo/**/*.*'
        ]
      }
    }

  });


  grunt.registerTask('test', ['concat', 'jshint', 'jasmine']);
  grunt.registerTask('default', ['concat', 'jshint', 'jasmine', 'uglify']);

  grunt.registerTask('demo', '', function (target) {
    grunt.task.run([
      'concat',
      'jshint',
      'uglify',
      'qunit',
      'copy:demo',
      'connect:livereload',
      'watch'
    ]);
  });

};
