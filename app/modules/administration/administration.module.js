angular.module('administration',[])
.config(['$stateProvider', ($stateProvider) => {

    const templateBase = 'app/modules/administration/';

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    const loginRequired = true;

    $stateProvider
        .state('administration', {
            url: '/administration',
            template: '<div ui-view class="cui-administration"></div>',
            access: loginRequired,
            abstract: true
        })
        // applications/package related
        .state('administration.applications', {
            url: '/applications',
            template: '<div ui-view class="cui-administration"></div>',
            access: loginRequired,
            abstract: true
        })
        .state('administration.applications.manageApplications', {
            url: '?page&pageSize&service.category',
            templateUrl: templateBase + 'applications/allApplications-manage.html',
            controller: returnCtrlAs('manageAllApplications'),
            access:loginRequired
        })
        .state('administration.applications.editPackage', {
            url: '/:pkgId/edit',
            templateUrl: templateBase + 'applications/editPackage/editPackage.html',
            controller: returnCtrlAs('editPackage'),
            access:loginRequired
        })
        .state('administration.applications.editService', {
            url: '/:serviceId/editService',
            templateUrl: templateBase + 'applications/editService/editService.html',
            controller: returnCtrlAs('editService'),
            access:loginRequired
        });
}]);
