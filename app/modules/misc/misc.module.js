angular.module('misc', [])
    .config(['$stateProvider', function($stateProvider) {

        const templateBase = 'app/modules/misc/';

        const returnCtrlAs = function(name, asPrefix) {
            return name + 'Ctrl as ' + (asPrefix ? asPrefix : '') + (asPrefix ? name[0].toUpperCase() + name.slice(1, name.length) : name);
        };

        const loginRequired = true;
        $stateProvider
            .state('welcome', {
                url: '/welcome',
                templateUrl: templateBase + 'welcome/welcome.html'
            })
            .state('search', {
                url: '/search?page&pageSize',
                templateUrl: templateBase + 'search/search.html',
                controller: returnCtrlAs('search'),
                access: {
                    permittedLogic:appConfig.globalSearch
                }
            })
            .state('misc', {
                url: '/status',
                templateUrl: templateBase + 'status/status.html'
            })
            .state('misc.404', {
                url: '/404',
                templateUrl: templateBase + 'status/status-404.html'
            })
            .state('misc.notAuth', {
                url: '/notAuthorized',
                templateUrl: templateBase + 'status/status-notAuth.html'
            })
            .state('misc.pendingStatus', {
                url: '/pendingStatus',
                templateUrl: templateBase + 'status/status-pendingStatus.html'
            })
            .state('misc.success', {
                url: '/success',
                templateUrl: templateBase + 'status/status-success.html'
            })
            .state('misc.loadError', {
                url: '/error',
                templateUrl: templateBase + 'status/status-loadError.html'
            });

    }]);
