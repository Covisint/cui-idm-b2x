angular.module('organization',[])
.config(['$stateProvider', ($stateProvider) =>  {

    const templateBase = 'app/modules/organization/';

   const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

    $stateProvider
        .state('organization', {
            url: '/organization',
            templateUrl: templateBase + 'organization.html'
        })
        // Profile --------------------------------------------------
        .state('organization.profile', {
            url: '/profile?userID&orgID',
            templateUrl: templateBase + 'profile/organization-profile.html',
            controller: returnCtrlAs('orgProfile')
        })
        // Directory ------------------------------------------------
        .state('organization.directory', {
            url: '/directory?orgID',
            templateUrl: templateBase + 'directory/organization-directory.html',
            controller: returnCtrlAs('orgDirectory')
        })
        .state('directory', {
            url: '/organization/directory',
            templateUrl: templateBase + 'directory/directory.html',
        })
        .state('directory.userDetails', {
            url: '/user-details?userID&orgID',
            views: {
                '': {
                    templateUrl: templateBase + 'directory/user-details/directory-userDetails.html',
                    controller: returnCtrlAs('userDetails')
                },
                'profile@directory.userDetails': {
                    templateUrl: templateBase + '/directory/user-details/sections/profile/userDetails-profile.html',
                    controller: returnCtrlAs('userDetailsProfile')
                },
                'applications@directory.userDetails': {
                    templateUrl: templateBase + '/directory/user-details/sections/applications/userDetails-applications.html',
                    controller: returnCtrlAs('userDetailsApps')
                },
                'roles@directory.userDetails': {
                    templateUrl: templateBase + '/directory/user-details/sections/roles/userDetails-roles.html',
                    controller: returnCtrlAs('userDetailsRoles')
                },
                'history@directory.userDetails': {
                    templateUrl: templateBase + '/directory/user-details/sections/history/userDetails-history.html',
                    controller: returnCtrlAs('userDetailsHistory')
                }
            }
        })
        // Hierarchy ------------------------------------------------
        .state('organization.hierarchy', {
            url: '/hierarchy?orgID',
            templateUrl: templateBase + 'hierarchy/organization-hierarchy.html',
            controller: returnCtrlAs('orgHierarchy')
        })
        // Roles ----------------------------------------------------
        .state('organization.roles', {
            url: '/roles',
            templateUrl: templateBase + 'roles/organization-roles.html',
            controller: returnCtrlAs('orgRoles')
        })
        // Invitation -----------------------------------------------
        .state('invitation', {
            url: '/organization/invitation',
            templateUrl: templateBase + 'invitation/organization-invitation.html'
        })
        .state('invitation.user', {
            url: '/user?orgID',
            templateUrl: templateBase + 'invitation/user/invitation-user.html',
            controller: returnCtrlAs('inviteUser')
        })
        .state('invitation.division', {
            url: '/division?orgID',
            templateUrl: templateBase + 'invitation/division/invitation-division.html',
            controller: returnCtrlAs('inviteDivision')
        })
        // Applications ---------------------------------------------
        .state('organization.applications', {
            url: '/organization/applications',
            templateUrl: templateBase + 'applications/organization-applications.html'
        })
        .state('applications.newGrant', {
            url: '/newGrant?userID',
            templateUrl: templateBase + 'applications/newGrant/applications-newGrant.html',
            controller: returnCtrlAs('newGrant')
        })
        .state('applications.pendingRequests', {
            url: '/pendingRequests?userID',
            templateUrl: templateBase + 'applications/pendingRequestsReview/applications-pendingRequests.html',
            controller: returnCtrlAs('pendingRequests')
        })
        .state('applications.pendingRequestsReview', {
            url: '/pendingRequests/review?userID',
            templateUrl: templateBase + 'applications/pendingRequestsReview/applications-pendingRequestsReview.html',
            controller: returnCtrlAs('pendingRequestsReview')
        });

}]);
