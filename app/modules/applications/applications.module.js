angular.module('applications',[])
.config(['$stateProvider', ($stateProvider) => {

    const templateBase = 'app/modules/applications/';

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    $stateProvider
        .state('applications', {
            url: '/applications',
            templateUrl : templateBase + 'applications.html'
        })
        .state('applications.myApplications', {
            url: '/?name&page&pageSize&category&sort&refine',
            templateUrl: templateBase + 'myApplications/myApplications.html',
            controller: returnCtrlAs('myApplications')
        })
        .state('applications.myApplicationDetails', {
            url: '/details/:appId',
            templateUrl: templateBase + 'myApplications/myApplications-details.html',
            controller: returnCtrlAs('myApplicationDetails')
        })
        .state('applications.newRequest', {
            url: '/request',
            templateUrl: templateBase + 'newRequestReview/newRequest.html',
            controller: returnCtrlAs('newAppRequest')
        })
        .state('applications.search', {
            url: '/search?name&category&page&pageSize',
            templateUrl: templateBase + 'search/applicationSearch.html',
            controller: returnCtrlAs('applicationSearch')
        })
        .state('applications.reviewRequest', {
            url: '/review',
            templateUrl: templateBase + 'newRequestReview/review.html',
            controller: returnCtrlAs('applicationReview')
        })
        .state('applications.orgApplications', {
            url: '/organization?id',
            templateUrl: templateBase + 'orgApplications/orgApplications.html',
            controller: returnCtrlAs('orgApplications')
        });

}]);
