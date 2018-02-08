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
        .state('administration.manageApplications', {
            url: '/applications?page&pageSize&service.category',
            templateUrl: templateBase + 'applications/allApplications-manage.html',
            controller: returnCtrlAs('manageAllApplications'),
            access:loginRequired
        });
}]);
