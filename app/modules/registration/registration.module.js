angular.module('registration',[])
.config(['$stateProvider', function($stateProvider) {

	const templateBase = 'app/modules/registration/';

    const returnCtrlAs = function(name, asPrefix) {
        return name + 'Ctrl as ' + (asPrefix? asPrefix : '') + (asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name);
    };

    $stateProvider
	.state('registration', {
		url: '/register',
        template: '<div ui-view></div>'
    })
    .state('registration.walkup', {
        url: '/walkup',
        templateUrl:templateBase + 'userWalkup/userWalkup.html',
        controller: returnCtrlAs('userWalkup'),
        menu: {
            desktop: false,
            mobile: false
        }
    })
    .state('registration.invitation', {
        url: '/invitation?inviteId&pin',
        templateUrl:templateBase + 'userInvited/userInvited.html',
        controller: returnCtrlAs('userInvited'),
        menu: {
            desktop: false,
            mobile: false
        }
    });

}]);
