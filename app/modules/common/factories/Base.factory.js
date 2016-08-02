angular.module('common')
.factory('Base', ($state, Countries, Timezones, Languages, $translate, LocaleService, User, Menu, API) => {
    return {
        appConfig: appConfig,
        countries: Countries,
        menu: Menu,
        getLanguageCode: Languages.getCurrentLanguageCode,
        languages: Languages.all,
        timezones: Timezones.all,
        user: User.user,
        loader: API.loader,
        apiError: API.error,
        goBack: (fallback) => {
            let previousState = $state.stateStack.pop();

            if (previousState.name.name !== '') {
                $state.go(previousState.name, previousState.params);
            }
            else if (fallback) {
                $state.go(fallback);
            }
            else {
                return;
            }
        },
        generateHiddenPassword: (password) => Array(password.length+1).join('•')
    }
})
