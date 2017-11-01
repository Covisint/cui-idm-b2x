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
        .state('user.appRequestHistory',{
            url: '/appRequestHistory?name&page&pageSize&sortBy&status',
            templateUrl: templateBase + 'appHistory/app-requestHistory.html',
            controller: returnCtrlAs('appRequestHistory'),
            access:loginRequired
        })
        .state('user.appGrantHistory',{
            url: '/appGrantHistory?name&page&pageSize&sortBy&status',
            templateUrl: templateBase + 'appHistory/app-grantHistory.html',
            controller: returnCtrlAs('appGrantHistory'),
            access:loginRequired
        })
        .state('user.roles',{
            url: '/roles',
            templateUrl: templateBase + 'roles/user-roles.html',
            controller: returnCtrlAs('userRoles'),
            access:loginRequired
        });

}]);
