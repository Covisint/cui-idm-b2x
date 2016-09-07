(function(angular, $) {
	let appConfig
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
