module.exports = function(grunt,config){
    return {
      build: {
        options: {
            archive: './build-artifacts/'+ config.name + '-'+ config.version + '-' + config.env + '-' + grunt.template.today('yyyymmddhhMMss') + '.zip'
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
