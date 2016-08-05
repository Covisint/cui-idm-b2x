angular.module('applications',[])
.config(['$stateProvider', ($stateProvider) => {

    const templateBase = 'app/modules/applications/';

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    const loginRequired = {
        loginRequired:true
    };

    $stateProvider
    // ---------------- My Applications ----------------
    .state('applications', {
        url: '/applications',
        templateUrl : templateBase + 'applications.html',
        access:loginRequired,
        abstract: true
    })
    .state('applications.myApplications', {
        url: '?name&page&pageSize&category&sort&refine',
        templateUrl: templateBase + 'myApplications/myApplications.html',
        controller: returnCtrlAs('myApplications'),
        access:loginRequired
    })
    .state('applications.myApplicationDetails', {
        url: '/details/:appId',
        templateUrl: templateBase + 'myApplications/myApplications-details.html',
        controller: returnCtrlAs('myApplicationDetails'),
        access:loginRequired
    })
    .state('applications.newRequest', {
        url: '/request',
        templateUrl: templateBase + 'newRequestReview/newRequest.html',
        controller: returnCtrlAs('newAppRequest'),
        access:loginRequired
    })
    .state('applications.search', {
        url: '/search?name&category&page&pageSize',
        templateUrl: templateBase + 'search/applicationSearch.html',
        controller: returnCtrlAs('applicationSearch'),
        access:loginRequired
    })
    .state('applications.reviewRequest', {
        url: '/review',
        templateUrl: templateBase + 'newRequestReview/applicationReview.html',
        controller: returnCtrlAs('applicationReview'),
        access:loginRequired
    })
    // ----------  Organization Applications  ----------
    .state('applications.orgApplications', {
        url: '/organization',
        template: '<div ui-view></div>',
        abstract: true,
        access: loginRequired
    })
    .state('applications.orgApplications.applicationList', {
        url: '',
        templateUrl: templateBase + 'orgApplications/applicationList/orgApplications-applicationList.html',
        controller: returnCtrlAs('orgApplications'),
        access: loginRequired
    })
    .state('applications.orgApplications.applicationDetails', {
        url: '/application/:appId/details',
        templateUrl: templateBase + 'orgApplications/applicationDetails/orgApplications-applicationDetails.html',
        controller: returnCtrlAs('orgApplicationDetails'),
        access: loginRequired
    })
    .state('applications.orgApplications.newGrant', {
        url: '/application/:appId/new-grant',
        templateUrl: templateBase + 'orgApplications/newGrant/orgApplications-newGrant.html',
        controller: returnCtrlAs('orgAppNewGrant'),
        access: loginRequired            
    })
    .state('applications.orgApplications.newRequest', {
        url: '/request',
        templateUrl: templateBase + 'orgApplications/appRequest/newRequest/appRequest-newRequest.html',
        controller: returnCtrlAs('orgAppRequest'),
        access: loginRequired
    })
    .state('applications.orgApplications.newRequestReview', {
        url: '/request/review',
        templateUrl: templateBase + 'orgApplications/appRequest/newRequestReview/appRequest-newRequestReview.html',
        controller: returnCtrlAs('orgAppRequestReview'),
        access: loginRequired
    })
    .state('applications.orgApplications.search', {
        url: '/search?name&category&page&pageSize',
        templateUrl: templateBase + 'orgApplications/search/orgApplications-search.html',
        controller: returnCtrlAs('orgAppSearch'),
        access: loginRequired
    });
}]);
