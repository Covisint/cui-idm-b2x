(function(angular, $) {

	$.get('./appConfig.json', function(configData) {
		let appConfig = Object.assign({}, appConfig, configData)

		$.get('./appConfig-env.json', function(envConfigData) {
			appConfig = Object.assign({}, appConfig, envConfigData)

			$.get('./package.json', function(packageJsonData) {
				const packageJson = Object.assign({}, packageJson, packageJsonData)
