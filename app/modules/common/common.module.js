angular.module('common',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule'])
.config(($translateProvider,$locationProvider,$urlRouterProvider,$injector,
    localStorageServiceProvider,$cuiIconProvider,$cuiI18nProvider,$paginationProvider,
    $stateProvider,$compileProvider,$cuiResizeHandlerProvider) => {

    $urlRouterProvider.rule(($injector, $location) => {
        const path = $location.path()
        const hasTrailingSlash = path[path.length-1] === '/'

        if (hasTrailingSlash) {
            const newPath = path.substr(0, path.length-1)
            return newPath
        }
    })

    localStorageServiceProvider.setPrefix('cui');
    // $locationProvider.html5Mode(true);

    const templateBase = 'app/modules/common/';

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    $stateProvider
    .state('auth', {
        url: '/auth?xsrfToken&cuid',
        controller: returnCtrlAs('auth'),
        templateUrl: templateBase + 'auth/auth.html',
        access:true
    });

    if (appConfig.languages) {
        if (!appConfig.languageResources) {
            console.error('You need to configure languageResources in your appConfig.json.');
        }

        /*
        *   This section will dynamically generate the correct path to versioned i18n assets 
        *   based off of current i18n version in use in the project.
        *
        *   This requires a proper appConfig.json setup. Please refer to the documentation in
        *   ./docs/features/cui-framework/cui-i18n.md for information on how to setup the appConfig.
        *
        *   Note: Grunt tasks will not automatically work with all of the possible setups of i18n assets.
        */

        if (appConfig.languageResources.hasOwnProperty('customDependencyName')) {
            // Loading in custom i18n project
            const customDependency = appConfig.languageResources.customDependencyName
            const dependencyType = appConfig.languageResources.dependencyType || 'dependencies'
            const customDependencyVersion = packageJson[dependencyType][customDependency].split('#v')[1]
            appConfig.languageResources.url = appConfig.languageResources.url.replace(/\{\{(.*?)\}\}/, customDependencyVersion)
        }
        else if (appConfig.languageResources.hasOwnProperty('dependencyOrigin') && appConfig.languageResources.dependencyOrigin === 'cui-idm-b2x') {
            // Loading in i18n dependency through B2X (generator projects)
            appConfig.languageResources.url = appConfig.languageResources.url.replace(/\{\{(.*?)\}\}/, i18nPackageJson.version)
        }
        else {
            // Loading in standalone cui-i18n dependency
            const dependencyType = appConfig.languageResources.dependencyType || 'dependencies'
            appConfig.languageResources.url = appConfig.languageResources.url.replace(/\{\{(.*?)\}\}/, packageJson[dependencyType]['@covisint/cui-i18n'])
        }

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

    // Cui Resize Handler Breakpoint Option
    if (appConfig.breakpointOption) {
        $cuiResizeHandlerProvider.setBreakpoint(appConfig.breakpointOption);
    } else {
        throw new Error('You don\'t have breakpointOption set in your appConfig.json');
    }

    $compileProvider.debugInfoEnabled(false);

});

angular.module('common')
.run(['LocaleService','$rootScope','$state','$http','$templateCache','$cuiI18n','User',
    'cui.authorization.routing','cui.authorization.evalRouteRequest','Menu','API','$cuiIcon','$timeout','PubSub','APIError','Loader','Theme','CuiRouteHistoryFactory',
(LocaleService,$rootScope,$state,$http,$templateCache,$cuiI18n,User,routing,evalRouteRequest,Menu,API,$cuiIcon,$timeout,PubSub,APIError,Loader,Theme,CuiRouteHistoryFactory) => {

    if(window.cuiApiInterceptor) {
        const cuiApiInterceptorConfig = {
            apiUris: [ appConfig.serviceUrl ],
            stopIfInvalidPayload: true
        }

        if(appConfig.debugServiceUrl) {
            cuiApiInterceptorConfig.apiUris.push(appConfig.debugServiceUrl)
        }

        const interceptors = [
            'Get',
            'PrePut',
            'PrePost',
            'PostPut',
            'PostPost'
        ]

        interceptors.forEach(interceptor => window.cuiApiInterceptor[`start${ interceptor }Interceptor`](cuiApiInterceptorConfig))
    }

    // Add locales here
    const languageNameObject = $cuiI18n.getLocaleCodesAndNames();

    for (var LanguageKey in languageNameObject) {
        LocaleService.setLocales(LanguageKey, languageNameObject[LanguageKey]);
    }

    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
        Theme.clear() 
        APIError.clearAll()
        Loader.clearAll()
        event.preventDefault();

        function attachAccessInfo(toState) {
            if (toState.access) {
                if (! _.isObject(toState.access)) {
                    toState.access = {};
                }
                toState.access.roles = User.getRoles();
                toState.access.entitlements = User.getEntitlements();
            } else {
                toState.access = {};                
            }
        }

        function go(toState, toParams, fromState, fromParams) {
            // NB... detailed access logic is evaluated upstream, in cui.authorization.evalRouteRequest...
            attachAccessInfo(toState);
            evalRouteRequest(toState, toParams, fromState, fromParams,'misc.notAuth');
            PubSub.publish('stateChange',{ toState, toParams, fromState, fromParams }); 
            Menu.handleStateChange(toState.menu);
        }

        const route = () => {
            if (appConfig.debugServiceUrl) {
                /**
                    appConfig.debugServiceUrl can be pointed at a localhost server to act as a mock API.
                        Ex: 'debugServiceUrl': 'http://localhost:8001'
                    mock api server source code 
                        https://github.com/thirdwavellc/cui-api-mock
                    NB this workaround is not calling new evalRouteRequest() logic.
                **/
                let userInfo = {};
                API.cui.getPerson({personId: 'personId'})
                .then((res) => {
                    userInfo = res;
                    return API.cui.getOrganization({ organizationId: res.organization.id });
                })
                .then((res) => {
                    userInfo.organization = res;
                    API.setUser(userInfo);
                });
                routing(toState, toParams, fromState, fromParams, []);
                PubSub.publish('stateChange',{ toState,toParams,fromState,fromParams }); // this is required to make the ui-sref-active-nested directive work
                Menu.handleStateChange(toState.menu );
            }
            else {
                /* deprecated...
                if (!toState.access || !toState.access.loginRequired) {
                    Menu.handleStateChange(toState.menu);
                    routing(toState, toParams, fromState, fromParams, User.getEntitlements());
                    PubSub.publish('stateChange',{ toState,toParams,fromState,fromParams }); // this is required to make the ui-sref-active-nested directive work with a multi-module approach
                    return;
                }
                else if (User.get() !== '[cuid]') {
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
                */
                if (!toState.access || User.get() !== '[cuid]') {
                    // ...route needs no User info... or ...route needs User and we have User info...
                    cui.log('stateChangeStart2', toState, toParams);
                    go(toState, toParams, fromState, fromParams);
                } else {
                    // ..route needs (loggedIn) User and we need User info...
                    API.authenticateUser({toState, toParams, fromState, fromParams}).then((res) => {
                        cui.log('stateChangeStart3', res.redirect.toState, res.redirect.toParams);
                        go(res.redirect.toState, res.redirect.toParams, res.redirect.fromState, res.redirect.fromParams);
                    });
                }
            }
        };

        if (_.isEmpty(API.cui)) {
            // async load API.cui
            API.initApi().then(() => {
                route();
            });
        } else {
            route();
        }
    });

    // $state.stateStack is a stack of states used by base.goBack()
    $state.stateStack = []

    $rootScope.$on('$stateChangeSuccess', (e, { toState, toParams, fromState, fromParams }) => {
        // For base.goBack()
        $state.stateStack.push({
            name: fromState.name,
            params: fromParams || {}
        })

        // routeHistory POC
        var routeTextArray = toState.name.split('.');
        CuiRouteHistoryFactory.add({
            text: routeTextArray[routeTextArray.length - 1],
            uiroute: toState.name,
            uirouteparams: toParams
        });

        cui.log('on $stateChangeSuccess', toState, toParams, fromState, fromParams, $state.stateStack);
    })

    angular.forEach($cuiIcon.getIconSets(), (iconSettings, namespace) => {
        $http.get(iconSettings.path, {
            cache: $templateCache
        });
    });

}]);
