angular.module('organization', [])
.config(['$stateProvider', ($stateProvider) =>  {

    const templateBase = 'app/modules/organization/';

    const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    const loginRequired = true;

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
            url: '/directory/:orgId?page&pageSize&sortBy&status&fullName',
            templateUrl: templateBase + 'directory/user-list/directory-userList.html',
            controller: returnCtrlAs('orgDirectory'),
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
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
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        .state('organization.directory.userAppDetails', {
            url: '/user-app-details/:appId?userId&orgId',
            templateUrl: templateBase + 'directory/user-app-details/directory-userAppDetails.html',
            controller: returnCtrlAs('userAppDetails'),
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        .state('organization.directory.orgDetails', {
            url: '/org-details?orgId&page&pageSize',
            views: {
                '': {
                    templateUrl: templateBase + 'directory/org-details/directory-orgDetails.html',
                    controller: returnCtrlAs('orgDetails')
                },
                'profile@organization.directory.orgDetails': {
                    templateUrl: templateBase + 'directory/org-details/sections/profile/orgDetails-profile.html',
                    controller: returnCtrlAs('orgDetailsProfile')
                },
                'applications@organization.directory.orgDetails': {
                    templateUrl: templateBase + 'directory/org-details/sections/applications/orgDetails-applications.html',
                    controller: returnCtrlAs('orgDetailsApps')
                },
                'users@organization.directory.orgDetails': {
                    templateUrl: templateBase + 'directory/org-details/sections/users/orgDetails-users.html',
                    controller: returnCtrlAs('orgDetailsUsers')
                },
                'hierarchy@organization.directory.orgDetails': {
                    templateUrl: templateBase + 'directory/org-details/sections/hierarchy/orgDetails-hierarchy.html',
                    controller: returnCtrlAs('orgDetailsHierarchy')
                }
            },
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        // Hierarchy ------------------------------------------------
        .state('organization.hierarchy', {
            url: '/hierarchy/:orgId',
            templateUrl: templateBase + 'hierarchy/organization-hierarchy.html',
            controller: returnCtrlAs('orgHierarchy'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })
        // applications----------------------------------------------
        .state('organization.applications', {
            url: '/applications/:orgId?name&page&pageSize&service.category&sortBy&refine',
            templateUrl: templateBase + 'applications/organization-applications.html',
            controller: returnCtrlAs('organizationApplications'),
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        .state('organization.applicationDetails', {
            url: '/applications/:appId/details/:orgId',
            templateUrl: templateBase + 'applications/applicationDetails/organization-applicationDetails.html',
            controller: returnCtrlAs('orgApplicationDetails'),
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        .state('organization.newRequest', {
            url: '/request',
            templateUrl: templateBase + 'applications/appRequest/newRequest/appRequest-newRequest.html',
            controller: returnCtrlAs('orgAppRequest'),
            access: loginRequired
        })
        .state('organization.newRequestReview', {
            url: '/request/review',
            templateUrl: templateBase + 'applications/appRequest/newRequestReview/appRequest-newRequestReview.html',
            controller: returnCtrlAs('orgAppRequestReview'),
            access: loginRequired
        })
        .state('organization.search', {
            url: '/search?name&category&page&pageSize',
            templateUrl: templateBase + 'applications/search/orgApplications-search.html',
            controller: returnCtrlAs('orgAppSearch'),
            access: loginRequired
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
            access: {
                permittedLogic:appConfig.orgAdminLogic
            }
        })
        .state('organization.requests.pendingRequestsReview', {
            url: '/pending-requests/review?userId&orgId',
            templateUrl: templateBase + 'requests/pendingRequestsReview/requests-pendingRequestsReview.html',
            controller: returnCtrlAs('pendingRequestsReview'),
            access: {
                permittedLogic:appConfig.orgAdminLogic
            }
        })
        // Approval of Org requests
        .state('organization.requests.organizationRequest', {
            url: '/organization-request?orgId&userId',
            templateUrl: templateBase + 'requests/organizationRequest/requests-organization.html',
            controller: returnCtrlAs('organizationRequest'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })
        .state('organization.requests.organizationRequestReview', {
            url: '/organization-request-review?orgId',
            templateUrl: templateBase + 'requests/organizationRequest/requests-organizationReview.html',
            controller: returnCtrlAs('organizationRequestReview'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })
        .state('organization.requests.organizationAppRequest', {
            url: '/organization-app-request?orgId&userId',
            templateUrl: templateBase + 'requests/organizationAppRequests/requests-organization.html',
            controller: returnCtrlAs('organizationAppRequest'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })
        .state('organization.requests.organizationAppRequestReview', {
            url: '/organization-app-request-review?orgId',
            templateUrl: templateBase + 'requests/organizationAppRequests/requests-organizationReview.html',
            controller: returnCtrlAs('organizationAppRequestReview'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })
        .state('organization.requests.personRequest', {
            url: '/person-request?userId&orgId',
            templateUrl: templateBase + 'requests/personRequest/requests-person.html',
            controller: returnCtrlAs('personRequest'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })
        .state('organization.requests.personRequestReview', {
            url: '/person-request-review?userId&orgId',
            templateUrl: templateBase + 'requests/personRequest/requests-personReview.html',
            controller: returnCtrlAs('personRequestReview'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })

        // ADMIN...
        .state('organization.requests.usersRegistrationRequests', {
            url:'/userRequests',
            templateUrl: templateBase + 'requests/usersRequests/usersRegistrationRequests/requests-RegistrationRequests.html',
            controller: returnCtrlAs('usersRegistrationRequests'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })
        .state('organization.requests.usersAppRequests', {
            url:'/applicationRequests',
            templateUrl: templateBase + 'requests/usersRequests/usersAppRequests/requests-AppRequests.html',
            controller: returnCtrlAs('usersAppRequests'),
            access: {
                permittedLogic:appConfig.orgAdminLogic
            }
        })
        .state('invitation', {
            url: '/invitation',
            template: '<div ui-view></div>',
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        .state('invitation.inviteSelect', {
            url: '/select',
            templateUrl:templateBase + 'invitation/invitation.html',
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        .state('invitation.inviteUser', {
            url: '/user',
            templateUrl:templateBase + 'invitation/user/user.html',
            controller: returnCtrlAs('user'),
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        .state('invitation.division', {
            url: '/division',
            templateUrl:templateBase + 'invitation/division/division.html',
            controller: returnCtrlAs('division'),
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        .state('invitation.tlo', {
            url: '/tlo',
            templateUrl:templateBase + 'invitation/tlo/tlo.html',
            controller: returnCtrlAs('tlo'),
            access: {
                permittedLogic:appConfig.accessByAnyAdmin
            }
        })
        // Org Requests/ADMIN
        .state('organization.requests.orgRegistrationRequests', {
            url:'/orgRequests?page&pageSize&organizationName',
            templateUrl: templateBase + 'requests/orgRequests/orgRegistrationRequests/requests-RegistrationRequests.html',
            controller: returnCtrlAs('orgRegistrationRequests'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        })
        .state('organization.requests.orgAppRequests', {
            url:'/orgApplicationRequests?pageSize&page',
            templateUrl: templateBase + 'requests/orgRequests/orgAppRequests/requests-AppRequests.html',
            controller: returnCtrlAs('orgAppRequests'),
            access: {
                permittedLogic:appConfig.accessToSecurityAndExchangeAdmins
            }
        });
}]);
