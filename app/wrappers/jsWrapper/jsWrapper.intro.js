(function(angular, $) {

	let appConfig
	let packageJson
	let i18nPackageJson

	$.ajax({ url: './appConfig.json', cache: false })
	.then(function(configData) {
		appConfig = Object.assign({}, appConfig, configData)
		return $.ajax({ url: './appConfig-env.json', cache: false })
	})
	.then(function(envConfigData) {
		appConfig = Object.assign({}, appConfig, envConfigData)
		return $.ajax({ url: './package.json', cache: false })
	})
	.then(function(packageJsonData) {
		packageJson = Object.assign({}, packageJson, packageJsonData)
		if (appConfig.languageResources.dependencyOrigin === 'cui-idm-b2x') {
			return $.ajax({ url: './node_modules/@covisint/cui-i18n/package.json', cache: false })
		}
		else return undefined
	})
	.then(function(i18nPackageJsonData) {
		if (i18nPackageJsonData !== undefined) {
			i18nPackageJson = Object.assign({}, i18nPackageJson, i18nPackageJsonData)	
		}
