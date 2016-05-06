angular.module('common')
.factory('Base',['$state','Countries','Timezones','Languages','$translate','LocaleService','User','API','Menu',
function($state,Countries,Timezones,Languages,$translate,LocaleService,User,API,Menu) {

    return {
        appConfig: appConfig,
        authInfo: API.authInfo,
        countries: Countries,
        getLanguageCode: Languages.getCurrentLanguageCode,
        languages: Languages.all,
        logout: API.cui.covLogout,
        menu: Menu,
        timezones: Timezones.all,
        user: User.user,
        userName: User.userName,
        goBack: (fallback) => {
            if ($state.previous.name.name !== '') {
                $state.go($state.previous.name, $state.previous.params);
            }
            else {
                $state.go(fallback);
            }
        },
        generateHiddenPassword: (password) => Array(password.length+1).join('•')
    };

}]);
