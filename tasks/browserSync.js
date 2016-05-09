module.exports = function(grunt,config){
  return {
    dev: {
      bsFiles: {
          src : [
              '**/*.html',
              '<%= config.concatAppDir %>',
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
          baseDir: '<%= config.buildDir %>'
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
          baseDir: '<%= config.buildSdkDir %>'
        }
      }
    }
  }
};