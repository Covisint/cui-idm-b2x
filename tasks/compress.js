module.exports = function(grunt, config) {
  return {
    build: {
      options: {
        archive: './app-' + config.env + '-' + grunt.template.today('yyyymmddhhmmss') + '.zip'
      },
      files: [
        {
          expand: true,
          cwd: 'build/',
          src: ['**', '!.DS_Store'],
          dest: './'
        }
      ]
    }
  }
}
