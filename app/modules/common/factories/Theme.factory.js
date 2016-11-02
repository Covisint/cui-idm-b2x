angular.module('common')
.factory('Theme', () => {

	/*
	*	Utilize this factory when you need to set styles on the top-level element based on the current router state.
	*	
	*	Full documentation on how to utilize and or customize the application with this factory can be found in:
	*	`./docs/features/factories/Theme.md`
	*/

	let activeTheme
	let defaultTheme

	const getTheme = () => {
		return activeTheme
	}

	const setTheme = (cssClass) => {
		activeTheme = cssClass
	}

	const getDefaultTheme = () => {
		return defaultTheme
	}

	const setDefaultTheme = (cssClass) => {
		defaultTheme = cssClass
	}

	const clearActiveTheme = () => {
		activeTheme = ''
	}

	const useDefaultTheme = () => {
		activeTheme = defaultTheme
	}

	const setActiveDefaultTheme = (cssClass) => {
		defaultTheme = cssClass
		activeTheme = cssClass
	}

    return {
    	get: getTheme,
    	set: setTheme,
    	getDefault: getDefaultTheme,
    	setDefault: setDefaultTheme,
    	useDefault: useDefaultTheme,
    	setActiveDefault: setActiveDefaultTheme,
    	clear: clearActiveTheme
    }

})
