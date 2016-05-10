module.exports = function(grunt,config){
  return {
    build: {
      files: [
        {
          src: 'index.html',
          dest: '<%= config.buildDir %>/index.html'
        }, {
          src: [
            'bower_components/cui-i18n/dist/cui-i18n/angular-translate/*.json',
            'bower_components/angular-i18n/*.js',
            'bower_components/cui-icons/iconList',
            'bower_components/cui-icons/dist/**/*.svg',
            'bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/*.json',
            'bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/*.json'
          ],
          dest: '<%= config.buildDir %>/'
        }
      ]
    },
    buildsdk: {
      files: [
        {
          src: 'index.html',
          dest: '<%= config.buildSdkDir %>/index.html'
        }, {
          src: [
            'bower_components/cui-i18n/dist/cui-i18n/angular-translate/*.json',
            'bower_components/angular-i18n/*.js',
            'bower_components/cui-icons/iconList',
            'bower_components/cui-icons/dist/**/*.svg',
            'bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/*.json',
            'bower_components/cui-i18n/dist/cui-i18n/angular-translate/timezones/*.json'
          ],
          dest: '<%= config.buildSdkDir %>/'
        }
      ]
    },
    dev: {
      src: 'appConfig-example.json',
      dest: 'appConfig.json'
    }
  };
};