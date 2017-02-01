angular.module('common')
.factory('Base', (APIError, BaseExtensions, Countries, Languages, LocaleService, Loader, Menu, Theme, Timezones, User, $state, $translate) => {

    const baseFactory = {
        apiError: APIError,
        appConfig: appConfig,
        countries: Countries,
        getLanguageCode: Languages.getCurrentLanguageCode,
        languages: Languages.all,
        loader: Loader,
        menu: Menu,
        theme: Theme,
        timezones: Timezones.all,
        user: User.user,

        goBack: (stateName) => {
            const numberOfStates = $state.stateStack.length
            let i = numberOfStates - 1 // Last state user visited
            let counter = 0
            let stateParams

            do {
                if ($state.stateStack[i].name === stateName) {
                    stateParams = $state.stateStack[i].params
                }
                i--
                counter++
            } while (!stateParams && i >= 0 && counter <= 20) // limit our attempts to 20

            if (!stateParams) $state.go(stateName)
            else $state.go(stateName, stateParams)
        },

        generateHiddenPassword: (password) => Array(password.length+1).join('•')
    }

    return Object.assign({}, baseFactory, BaseExtensions)

})
