angular.module('organization',[])
.config(['$stateProvider', function($stateProvider) {

	const templateBase = 'app/modules/organization/';

    const returnCtrlAs = function(name, asPrefix) {
        return name + 'Ctrl as ' + (asPrefix? asPrefix : '') + (asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name);
    };

    $stateProvider
        .state('organization', {
            url: '/organization',
            templateUrl: templateBase + 'organization.html'
        })
        .state('organization.profile', {
            url: '/profile?id',
            templateUrl: templateBase + 'profile/organization-profile.html',
            controller: returnCtrlAs('orgProfile')
        })
        .state('organization.directory', {
            url: '/directory?id',
            templateUrl: templateBase + 'directory/organization-directory.html',
            controller: returnCtrlAs('orgDirectory')
        })
        .state('organization.hierarchy', {
            url: '/hierarchy?id',
            templateUrl: templateBase + 'hierarchy/organization-hierarchy.html',
            controller: returnCtrlAs('orgHierarchy')
        })
        .state('organization.roles', {
            url: '/roles',
            templateUrl: templateBase + 'roles/organization-roles.html',
            controller: returnCtrlAs('orgRoles')
        })
        .state('directory', {
            url: '/organization/directory',
            templateUrl: templateBase + 'directory/directory.html'
        })
        .state('directory.userDetails', {
            url: '/user-details?userId&orgId',
            templateUrl: templateBase + 'directory/user-details/directory-userDetails.html',
            controller: returnCtrlAs('userDetails')
        });

}]);
