angular.module('common')
.factory('Base', ($state, Countries, Timezones, Languages, $translate, LocaleService, User, Menu, Loader, APIError) => {
    return {
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
            if ($state.previous.name.name !== '') {
                $state.go($state.previous.name, $state.previous.params);
            }
            else {
                $state.go(fallback);
            }
        },
        generateHiddenPassword: (password) => Array(password.length+1).join('•')
    }

})
