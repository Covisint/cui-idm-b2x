angular.module('organization', [])
.config(['$stateProvider', ($stateProvider) =>  {

    const templateBase = 'app/modules/organization/';

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    const loginRequired = {
        loginRequired: true
    };

    $stateProvider
        .state('organization', {
            url: '/organization',
            template: '<div ui-view></div>',
            access: loginRequired
        })
        // Profile --------------------------------------------------
        .state('organization.profile', {
            url: '/profile?userID&orgID',
            templateUrl: templateBase + 'profile/organization-profile.html',
            controller: returnCtrlAs('orgProfile'),
            access: loginRequired
        })
        // Directory ------------------------------------------------
        .state('organization.directory', {
            abstract:true,
            template: '<div ui-view></div>'
        })
        .state('organization.directory.userList', {
            url: '/directory?orgId&page&pageSize&sortBy&refine',
            templateUrl: templateBase + 'directory/user-list/directory-userList.html',
            controller: returnCtrlAs('orgDirectory'),
            access: loginRequired
        })
        .state('organization.directory.userDetails', {
            url: '/user-details?userId&orgId',
            views: {
                '': {
                    templateUrl: templateBase + 'directory/user-details/directory-userDetails.html',
                    controller: returnCtrlAs('userDetails')
                },
                'profile@organization.directory.userDetails': {
                    templateUrl: templateBase + 'directory/user-details/sections/profile/userDetails-profile.html',
                    controller: returnCtrlAs('userDetailsProfile')
                },
                'applications@organization.directory.userDetails': {
                    templateUrl: templateBase + 'directory/user-details/sections/applications/userDetails-applications.html',
                    controller: returnCtrlAs('userDetailsApps')
                },
                'roles@organization.directory.userDetails': {
                    templateUrl: templateBase + 'directory/user-details/sections/roles/userDetails-roles.html',
                    controller: returnCtrlAs('userDetailsRoles')
                },
                'history@organization.directory.userDetails': {
                    templateUrl: templateBase + 'directory/user-details/sections/history/userDetails-history.html',
                    controller: returnCtrlAs('userDetailsHistory')
                }
            },
            access: loginRequired
        })
        // Hierarchy ------------------------------------------------
        .state('organization.hierarchy', {
            url: '/hierarchy?orgID',
            templateUrl: templateBase + 'hierarchy/organization-hierarchy.html',
            controller: returnCtrlAs('orgHierarchy'),
            access:loginRequired
        })
        // Roles ----------------------------------------------------
        .state('organization.roles', {
            url: '/roles?orgID',
            templateUrl: templateBase + 'roles/organization-roles.html',
            controller: returnCtrlAs('orgRoles'),
            access:loginRequired
        })
        // Requests -------------------------------------------------
        .state('organization.requests', {
            url: '/requests',
            template: '<div ui-view></div>',
            access: loginRequired
        })
        .state('organization.requests.newGrant', {
            url: '/new-grant?userID',
            templateUrl: templateBase + 'requests/newGrant/requests-newGrant.html',
            controller: returnCtrlAs('newGrant'),
            access: loginRequired
        })
        .state('organization.requests.newGrantSearch', {
            url: '/search?type&category&name&userID&page&pageSize&sortBy',
            templateUrl: templateBase + 'requests/newGrant/search/search.html',
            controller: returnCtrlAs('newGrantSearch'),
            access: loginRequired
        })
        .state('organization.requests.newGrantClaims', {
            url: '/claims?userID',
            templateUrl: templateBase + 'requests/newGrant/claims/claims.html',
            controller: returnCtrlAs('newGrantClaims'),
            access: loginRequired
        })
        .state('organization.requests.pendingRequests', {
            url: '/pending-requests?userID&orgID',
            templateUrl: templateBase + 'requests/pendingRequestsReview/requests-pendingRequests.html',
            controller: returnCtrlAs('pendingRequests'),
            access: loginRequired
        })
        .state('organization.requests.pendingRequestsReview', {
            url: '/pending-requests/review?userID&orgID',
            templateUrl: templateBase + 'requests/pendingRequestsReview/requests-pendingRequestsReview.html',
            controller: returnCtrlAs('pendingRequestsReview'),
            access: loginRequired
        })
        .state('organization.requests.organizationRequest', {
            url: '/organization-request?orgID&registrantID',
            templateUrl: templateBase + 'requests/organizationRequest/requests-organization.html',
            controller: returnCtrlAs('orgRequest'),
            access: loginRequired
        })
        .state('organization.requests.organizationRequestReview', {
            url: '/organization-request-review?orgID',
            templateUrl: templateBase + 'requests/organizationRequest/requests-organizationReview.html',
            controller: returnCtrlAs('orgRequestReview'),
            access: loginRequired
        })
        .state('organization.requests.personRequest', {
            url: '/person-request?userID&orgID',
            templateUrl: templateBase + 'requests/personRequest/requests-person.html',
            controller: returnCtrlAs('personRequest'),
            access: loginRequired
        })
        .state('organization.requests.personRequestReview', {
            url: '/person-request-review?userID&orgID',
            templateUrl: templateBase + 'requests/personRequest/requests-personReview.html',
            controller: returnCtrlAs('personRequestReview'),
            access: loginRequired
        });

}]);
