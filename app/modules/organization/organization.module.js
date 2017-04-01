angular.module('organization', [])
.config(['$stateProvider', ($stateProvider) =>  {

    const templateBase = 'app/modules/organization/';

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    const loginRequired = true;

    const accessByAnyAdmin = {
        permittedLogic:{
        all: {
            roles: {
                any: [
                    "Application Admin",
                    "Security Administrator",
                    "Individual Service Admin - Owning Org",
                    "TIB Administrator",
                    "Organization Service Admin",
                    "Organization Password Administrator",
                    "Federation Configuration Admin",
                    "Provider Administrator",
                    "Exchange Operator",
                    "Help Desk Plus",
                    "Service Administrator",
                    "Help Desk Basic",
                    "User Account Administrator"
                ]
            }
        }
    }
    }

    $stateProvider
        .state('organization', {
            url: '/organization',
            template: '<div ui-view></div>',
            access: loginRequired
        })
        // Profile --------------------------------------------------
        .state('organization.profile', {
            url: '/profile/:orgId?userId',
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
            url: '/directory/:orgId?page&pageSize&sortBy&refine',
            templateUrl: templateBase + 'directory/user-list/directory-userList.html',
            controller: returnCtrlAs('orgDirectory'),
            access: accessByAnyAdmin
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
            access: accessByAnyAdmin
        })
        // Hierarchy ------------------------------------------------
        .state('organization.hierarchy', {
            url: '/hierarchy/:orgId',
            templateUrl: templateBase + 'hierarchy/organization-hierarchy.html',
            controller: returnCtrlAs('orgHierarchy'),
            access:loginRequired
        })
        // applications----------------------------------------------
        .state('organization.applications', {
            url: '/applications/:orgId?name&page&pageSize&service.category&sortBy&refine',
            templateUrl: templateBase + 'applications/organization-applications.html',
            controller: returnCtrlAs('organizationApplications'),
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
            url: '/new-grant?orgId&userId',
            templateUrl: templateBase + 'requests/newGrant/requests-newGrant.html',
            controller: returnCtrlAs('newGrant'),
            access: {
                permittedLogic:appConfig.grantAppToUserLogic
            }
        })
        .state('organization.requests.newGrantSearch', {
            url: '/search?type&category&name&orgId&userId&page&pageSize&sortBy',
            templateUrl: templateBase + 'requests/newGrant/search/search.html',
            controller: returnCtrlAs('newGrantSearch'),
            access: {
                permittedLogic:appConfig.grantAppToUserLogic
            }
        })
        .state('organization.requests.newGrantClaims', {
            url: '/claims?orgId&userId',
            templateUrl: templateBase + 'requests/newGrant/claims/claims.html',
            controller: returnCtrlAs('newGrantClaims'),
            access: {
                permittedLogic:appConfig.grantAppToUserLogic
            }
        })
        // Org Grant
        .state('organization.requests.newOrgGrant', {
            url: '/new-org-grant?orgId',
            templateUrl: templateBase + 'requests/newOrgGrant/requests-newGrant.html',
            controller: returnCtrlAs('newOrgGrant'),
            access: {
                permittedLogic:appConfig.grantAppToOrgLogic
            }
        })
        .state('organization.requests.newOrgGrantSearch', {
            url: '/search-org?type&category&name&orgId&page&pageSize&sortBy',
            templateUrl: templateBase + 'requests/newOrgGrant/search/search.html',
            controller: returnCtrlAs('newOrgGrantSearch'),
            access: {
                permittedLogic:appConfig.grantAppToOrgLogic
            }
        })
        .state('organization.requests.newOrgGrantClaims', {
            url: '/claims-org?orgId',
            templateUrl: templateBase + 'requests/newOrgGrant/claims/claims.html',
            controller: returnCtrlAs('newOrgGrantClaims'),
            access: {
                permittedLogic:appConfig.grantAppToOrgLogic
            }
        })
        .state('organization.requests.pendingRequests', {
            url: '/pending-requests?userId&orgId',
            templateUrl: templateBase + 'requests/pendingRequestsReview/requests-pendingRequests.html',
            controller: returnCtrlAs('pendingRequests'),
            access: loginRequired
        })
        .state('organization.requests.pendingRequestsReview', {
            url: '/pending-requests/review?userId&orgId',
            templateUrl: templateBase + 'requests/pendingRequestsReview/requests-pendingRequestsReview.html',
            controller: returnCtrlAs('pendingRequestsReview'),
            access: loginRequired
        })
        .state('organization.requests.organizationRequest', {
            url: '/organization-request?orgId&userId',
            templateUrl: templateBase + 'requests/organizationRequest/requests-organization.html',
            controller: returnCtrlAs('organizationRequest'),
            access: loginRequired
        })
        .state('organization.requests.organizationRequestReview', {
            url: '/organization-request-review?orgId',
            templateUrl: templateBase + 'requests/organizationRequest/requests-organizationReview.html',
            controller: returnCtrlAs('organizationRequestReview'),
            access: loginRequired
        })
        .state('organization.requests.personRequest', {
            url: '/person-request?userId&orgId',
            templateUrl: templateBase + 'requests/personRequest/requests-person.html',
            controller: returnCtrlAs('personRequest'),
            access: loginRequired
        })
        .state('organization.requests.personRequestReview', {
            url: '/person-request-review?userId&orgId',
            templateUrl: templateBase + 'requests/personRequest/requests-personReview.html',
            controller: returnCtrlAs('personRequestReview'),
            access: loginRequired
        })

        // ADMIN...
        .state('organization.requests.usersRegistrationRequests', {
            url:'/userRequests',
            templateUrl: templateBase + 'requests/usersRequests/usersRegistrationRequests/requests-RegistrationRequests.html',
            controller: returnCtrlAs('usersRegistrationRequests'),
            access: appConfig.orgAdminLogic
        })
        .state('organization.requests.usersAppRequests', {
            url:'/applicationRequests',
            templateUrl: templateBase + 'requests/usersRequests/usersAppRequests/requests-AppRequests.html',
            controller: returnCtrlAs('usersAppRequests'),
            access: appConfig.orgAdminLogic
        })

        // Org Requests/ADMIN
        .state('organization.requests.orgRegistrationRequests', {
            url:'/orgRequests',
            templateUrl: templateBase + 'requests/orgRequests/orgRegistrationRequests/requests-RegistrationRequests.html',
            controller: returnCtrlAs('orgRegistrationRequests'),
            access: appConfig.orgAdminLogic
        })
        .state('organization.requests.orgAppRequests', {
            url:'/orgApplicationRequests',
            templateUrl: templateBase + 'requests/orgRequests/orgAppRequests/requests-AppRequests.html',
            controller: returnCtrlAs('orgAppRequests'),
            access: appConfig.orgAdminLogic
        });
}]);
