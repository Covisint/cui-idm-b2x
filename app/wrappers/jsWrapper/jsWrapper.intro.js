(function(angular, $) {
	
	let appConfig
	let packageJson

	$.ajax({
	        url: './appConfig.json',
	        success: (result) => appConfig = Object.assign({}, appConfig, result),
	        async: false
	})
	$.ajax({
	        url: './appConfig-env.json',
	        success: (result) => appConfig = Object.assign({}, appConfig, result),
	        async: false
	})
	$.ajax({
		url: './package.json',
		success: (result) => packageJson = Object.assign({}, packageJson, result),
		async: false
	})
