module.exports = function(grunt,config){
    return {
      build: {
        options: {
            archive: config.artifactDir + '/' + config.buildArtifact
        },
        files: [
          {
              expand:true,
              cwd: 'build/',
              src: ['**','!.DS_Store'],
              dest: './'
          }
        ]
      }
    }
  }
