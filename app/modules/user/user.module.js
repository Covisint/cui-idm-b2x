angular.module('user',[])
.config(['$stateProvider', function($stateProvider) {

	const templateBase = 'app/modules/user/';

    const returnCtrlAs = function(name, asPrefix) {
        return name + 'Ctrl as ' + (asPrefix? asPrefix : '') + (asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name);
    };

    $stateProvider
        .state('user', {
            url: '/user',
            templateUrl: templateBase + 'user.html'
        })
        .state('user.profile', {
            url: '/profile',
            templateUrl: templateBase + 'profile/user-profile.html',
            controller: returnCtrlAs('userProfile')
        });

}]);
