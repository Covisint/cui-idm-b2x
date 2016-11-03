(function(angular, $) {

	let appConfig
	let packageJson
	let i18nPackageJson

	$.get('./appConfig.json')
	.then(function(configData) {
		appConfig = Object.assign({}, appConfig, configData)
		return $.get('./appConfig-env.json')
	})
	.then(function(envConfigData) {
		appConfig = Object.assign({}, appConfig, envConfigData)
		return $.get('./package.json')
	})
	.then(function(packageJsonData) {
		packageJson = Object.assign({}, packageJson, packageJsonData)
		if (appConfig.languageResources.dependencyOrigin === 'cui-idm-b2x') {
			return $.get('./node_modules/@covisint/cui-i18n/package.json')
		}
		else return undefined
	})
	.then(function(i18nPackageJsonData) {
		if (i18nPackageJsonData !== undefined) {
			i18nPackageJson = Object.assign({}, i18nPackageJson, i18nPackageJsonData)	
		}
	})
	.always(function() {
