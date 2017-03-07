angular.module('user', [])
.config(['$stateProvider', function($stateProvider) {

	const templateBase = 'app/modules/user/';

    const returnCtrlAs = function(name, asPrefix) {
        return name + 'Ctrl as ' + (asPrefix? asPrefix : '') + (asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name);
    };

    const loginRequired = true;

    $stateProvider
        .state('user', {
            url: '/user',
            template: '<div ui-view></div>',
            access:loginRequired
        })
        .state('user.profile', {
            url: '/profile',
            templateUrl: templateBase + 'profile/user-profile.html',
            controller: returnCtrlAs('userProfile'),
            access:loginRequired
        })
        .state('user.history',{
            url: '/history',
            templateUrl: templateBase + 'history/user-history.html',
            controller: returnCtrlAs('userHistory'),
            access:loginRequired
        })
        .state('user.appHistory',{
            url: '/appHistory?name&page&pageSize&sortBy&status',
            templateUrl: templateBase + 'appHistory/app-history.html',
            controller: returnCtrlAs('appHistory'),
            access:loginRequired
        });

}]);
