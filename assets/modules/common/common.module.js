angular.module('common')
.config(['$translateProvider','$locationProvider','$urlRouterProvider','$injector','localStorageServiceProvider',
    '$cuiIconProvider','$cuiI18nProvider','$paginationProvider','$stateProvider',
function($translateProvider,$locationProvider,$urlRouterProvider,$injector,localStorageServiceProvider,$cuiIconProvider,
    $cuiI18nProvider,$paginationProvider,$stateProvider) {

    localStorageServiceProvider.setPrefix('cui');
    // $locationProvider.html5Mode(true);

    const templateBase = 'assets/modules/';

    const returnCtrlAs =  function(name, asPrefix) {
        return name + 'Ctrl as ' + (asPrefix? asPrefix : '') + (asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name);
    };

    $stateProvider
    .state('empty', {
        url: '/empty',
        templateUrl: templateBase + 'common/empty/empty.html',
        controller: returnCtrlAs('empty')
    });

    if (appConfig.languages) {
        $cuiI18nProvider.setLocaleCodesAndNames(appConfig.languages);
        let languageKeys = Object.keys($cuiI18nProvider.getLocaleCodesAndNames());

        const returnRegisterAvailableLanguageKeys = function() {
            // Reroute unknown language to prefered language
            let object = {'*': languageKeys[0]}; 
            languageKeys.forEach(function(languageKey) {
                // Redirect language keys such as en_US to en
                object[languageKey + '*'] = languageKey; 
            });
            return object;
        };

        $translateProvider.useLoader('LocaleLoader', {
            url: 'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
            prefix: 'locale-',
            suffix: '.json'
        })
        .registerAvailableLanguageKeys(languageKeys, returnRegisterAvailableLanguageKeys())
        .uniformLanguageTag('java')
        .determinePreferredLanguage()
        .fallbackLanguage(languageKeys);

        $cuiI18nProvider.setLocalePreference(languageKeys);
    }

    if (appConfig.iconSets) {
        appConfig.iconSets.forEach(function(iconSet) {
            $cuiIconProvider.iconSet(iconSet.name, iconSet.path, iconSet.defaultViewBox || null);
        });
    }

    // Pagination Results Per Page Options
    if (appConfig.paginationOptions) {
        $paginationProvider.setPaginationOptions(appConfig.paginationOptions);
    }

}]);

angular.module('common')
.run(['LocaleService','$rootScope','$state','$http','$templateCache','$cuiI18n','User',
    'cui.authorization.routing','Menu','API','$cuiIcon',
function(LocaleService,$rootScope,$state,$http,$templateCache,$cuiI18n,User,routing,Menu,API,$cuiIcon) {

    // Add locales here
    const languageNameObject = $cuiI18n.getLocaleCodesAndNames();

    for (var LanguageKey in languageNameObject) {
        LocaleService.setLocales(LanguageKey, languageNameObject[LanguageKey]);
    }

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        // CUI Auth
        API.handleCovAuthResponse(event, toState, toParams, fromState, fromParams);
        // Determine if user is able to access the particular route we're navigation to
        routing($rootScope, $state, toState, toParams, fromState, fromParams, User.getEntitlements());
        // Menu handling
        Menu.handleStateChange(toState.menu);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) { 
        // For base.goBack()
        $state.previous = {};
        $state.previous.name = fromState;
        $state.previous.params = fromParams;
    });

    angular.forEach($cuiIcon.getIconSets(), function(iconSettings, namespace) {
        $http.get(iconSettings.path, {
            cache: $templateCache
        });
    });

}]);
