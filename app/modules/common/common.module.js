angular.module('common',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule'])
.config(($translateProvider,$locationProvider,$urlRouterProvider,$injector,
    localStorageServiceProvider,$cuiIconProvider,$cuiI18nProvider,$paginationProvider,
    $stateProvider,$compileProvider) => {

    localStorageServiceProvider.setPrefix('cui');
    // $locationProvider.html5Mode(true);

    const templateBase = 'app/modules/common/';

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    const loginRequired = {
        loginRequired:true
    };

    $stateProvider
    .state('auth', {
        url: '/auth?xsrfToken&cuid',
        controller: returnCtrlAs('auth'),
        templateUrl: templateBase + 'auth/auth.html',
        access:loginRequired
    });

    if (appConfig.languages) {
        if(!appConfig.languageResources) console.error('You need to configure languageResources in your appConfig.json.');

        $cuiI18nProvider.setLocaleCodesAndNames(appConfig.languages);
        let languageKeys = Object.keys($cuiI18nProvider.getLocaleCodesAndNames());

        const returnRegisterAvailableLanguageKeys = () => {
            // Reroute unknown language to prefered language
            let object = {'*': languageKeys[0]};
            languageKeys.forEach(function(languageKey) {
                // Redirect language keys such as en_US to en
                object[languageKey + '*'] = languageKey;
            });
            return object;
        };

        $translateProvider.useLoader('LocaleLoader', appConfig.languageResources )
        .registerAvailableLanguageKeys(languageKeys, returnRegisterAvailableLanguageKeys())
        .uniformLanguageTag('java')
        .determinePreferredLanguage()
        .fallbackLanguage(languageKeys);

        $cuiI18nProvider.setLocalePreference(languageKeys);
    }

    if (appConfig.iconSets) {
        appConfig.iconSets.forEach((iconSet) => {
            $cuiIconProvider.iconSet(iconSet.name, iconSet.path, iconSet.defaultViewBox || null);
        });
    }

    // Pagination Results Per Page Options
    if (appConfig.paginationOptions) {
        $paginationProvider.setPaginationOptions(appConfig.paginationOptions)
    }
    else {
        throw new Error(`You don't have paginationOptions set in your appConfig.json`)
    }

    $compileProvider.debugInfoEnabled(false);

});

angular.module('common')
.run(['LocaleService','$rootScope','$state','$http','$templateCache','$cuiI18n','User',
    'cui.authorization.routing','Menu','API','$cuiIcon','$timeout','PubSub',
(LocaleService,$rootScope,$state,$http,$templateCache,$cuiI18n,User,routing,Menu,API,$cuiIcon,$timeout,PubSub) => {

    if(window.cuiApiInterceptor) {
        const cuiApiInterceptorConfig = {
            apiUris: [ appConfig.serviceUrl ],
            stopIfInvalidPayload: true
        }

        const interceptors = [
            'Get',
            'PrePut',
            'PrePost',
            'PostPut',
            'PostPost'
        ];

        interceptors.forEach(interceptor => window.cuiApiInterceptor[`start${ interceptor }Interceptor`](cuiApiInterceptorConfig))
    }

    // Add locales here
    const languageNameObject = $cuiI18n.getLocaleCodesAndNames();

    for (var LanguageKey in languageNameObject) {
        LocaleService.setLocales(LanguageKey, languageNameObject[LanguageKey]);
    }

    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
        event.preventDefault();
        const route = ()=> {
            if(!toState.access || !toState.access.loginRequired) {
                Menu.handleStateChange(toState.menu);
                routing(toState, toParams, fromState, fromParams, User.getEntitlements());
                PubSub.publish('stateChange',{ toState,toParams,fromState,fromParams }); // this is required to make the ui-sref-active-nested directive work with a multi-module approach
                return;
            }
            else if (User.get()!=='[cuid]'){
                routing(toState, toParams, fromState, fromParams, User.getEntitlements());
                PubSub.publish('stateChange',{ toState, toParams, fromState, fromParams });
                Menu.handleStateChange(toState.menu);
            }
            else {
                API.authenticateUser({ toState,toParams,fromState,fromParams })
                .then((res) => {
                    const { toState, toParams, fromState, fromParams } = res.redirect;
                    // Determine if user is able to access the particular route we're navigating to
                    routing(toState, toParams, fromState, fromParams, res.roleList);
                    PubSub.publish('stateChange',{ toState, toParams, fromState, fromParams }); // this is required to make the ui-sref-active-nested directive work with a multi-module approach
                    // Menu handling
                    Menu.handleStateChange(res.redirect.toState.menu);
                });
            }
        };

        // sync load API.ccui here
        if(_.isEmpty(API.cui)){
            API.initApi()
            .then(()=>{
                route();
            });
        }
        else route();
    });

    $rootScope.$on('$stateChangeSuccess', (e, { toState, toParams, fromState, fromParams }) => {
        // For base.goBack()
        $state.previous = {};
        $state.previous.name = fromState;
        $state.previous.params = fromParams;
    });

    angular.forEach($cuiIcon.getIconSets(), (iconSettings, namespace) => {
        $http.get(iconSettings.path, {
            cache: $templateCache
        });
    });

}]);
