angular.module('common')
.factory('Base', ($state, Countries, Timezones, Languages, $translate, LocaleService, User, Menu, Loader, APIError, BaseExtensions) => {
    const baseFactory = {
        appConfig: appConfig,
        countries: Countries,
        getLanguageCode: Languages.getCurrentLanguageCode,
        languages: Languages.all,
        menu: Menu,
        timezones: Timezones.all,
        user: User.user,
        loader: Loader,
        apiError: APIError,

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

    return Object.assign({}, baseFactory, BaseExtensions)

})
