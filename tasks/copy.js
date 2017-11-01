module.exports = function(grunt, config) {
  return {
    build: {
      files: [
        {
          src: 'index.html',
          dest: '<%= config.buildDir %>/index.html'
        },
        {
          src: 'package.json',
          dest: '<%= config.buildDir %>/package.json'
        },
        {
          expand: true,
          cwd: 'unsupported/',
          src: ['**'],
          dest: '<%= config.buildDir %>/'
        },
        {
          src: [
            'node_modules/@covisint/cui-i18n/dist/<%= config.i18nVersion %>/cui-i18n/angular-translate/*.json',
            'node_modules/angular-i18n/*.js',
            'node_modules/@covisint/cui-icons/iconList',
            'node_modules/@covisint/cui-icons/dist/**/*.svg',
            'node_modules/@covisint/cui-i18n/dist/<%= config.i18nVersion %>/cui-i18n/angular-translate/countries/*.json',
            'node_modules/@covisint/cui-i18n/dist/<%= config.i18nVersion %>/cui-i18n/angular-translate/timezones/*.json',
            'node_modules/lato-font/fonts/lato-normal/**',
            'node_modules/lato-font/fonts/lato-bold/**',
            'node_modules/lato-font/fonts/lato-black/**',
            'appConfig.json',
            'appConfig-env.json',
            'appConfig-build.json',
            'app/json/*.json',
            'socialredirect/**'
          ],
          dest: '<%= config.buildDir %>/'
        },
		{
		 src: ['app/modules/user/user_icon/**/*'],
		 dest: '<%= config.buildDir %>/'
		 }
      ]
    },
    buildsdk: {
      files: [
        {
          src: 'index.html',
          dest: '<%= config.buildSdkDir %>/index.html'
        }, 
        {
          expand: true,
          cwd: 'unsupported/',
          src: ['**'],
          dest: '<%= config.buildDir %>/'
        },
        {
          src: [
            'node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/*.json',
            'node_modules/angular-i18n/*.js',
            'node_modules/@covisint/cui-icons/iconList',
            'node_modules/@covisint/cui-icons/dist/**/*.svg',
            'node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/countries/*.json',
            'node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/timezones/*.json',
            'node_modules/lato-font/fonts/lato-normal/**',
            'node_modules/lato-font/fonts/lato-bold/**',
            'node_modules/lato-font/fonts/lato-black/**',
            'appConfig.json',
            'appConfig-env.json',
            'appConfig-build.json',
            'app/json/*.json'
          ],
          dest: '<%= config.buildSdkDir %>/'
        }
      ]
    }
  };
};