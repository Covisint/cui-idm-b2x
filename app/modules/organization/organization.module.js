angular.module('organization',[])
.config(['$stateProvider', ($stateProvider) =>  {

    const templateBase = 'app/modules/organization/';

   const returnCtrlAs = (name, asPrefix) => `${name}Ctrl as ${ asPrefix || ''}${(asPrefix? name[0].toUpperCase() + name.slice(1, name.length) : name)}`;

   const loginRequired = {
       loginRequired:true
   };

    $stateProvider
        .state('organization', {
            url: '/organization',
            templateUrl: templateBase + 'organization.html',
            access:loginRequired
        })
        // Profile --------------------------------------------------
        .state('organization.profile', {
            url: '/profile?userID&orgID',
            templateUrl: templateBase + 'profile/organization-profile.html',
            controller: returnCtrlAs('orgProfile'),
            access:loginRequired
        })
        // Directory ------------------------------------------------
        .state('organization.directory', {
            url: '/directory?orgID',
            templateUrl: templateBase + 'directory/organization-directory.html',
            controller: returnCtrlAs('orgDirectory'),
            access:loginRequired
        })
        .state('directory', {
            url: '/organization/directory',
            templateUrl: templateBase + 'directory/directory.html',
            access:loginRequired
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
            },
            access:loginRequired
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
            url: '/roles',
            templateUrl: templateBase + 'roles/organization-roles.html',
            controller: returnCtrlAs('orgRoles'),
            access:loginRequired
        })
        // Invitation -----------------------------------------------
        .state('invitation', {
            url: '/organization/invitation',
            templateUrl: templateBase + 'invitation/organization-invitation.html',
            access:loginRequired
        })
        .state('invitation.user', {
            url: '/user?orgID',
            templateUrl: templateBase + 'invitation/user/invitation-user.html',
            controller: returnCtrlAs('inviteUser'),
            access:loginRequired
        })
        .state('invitation.division', {
            url: '/division?orgID',
            templateUrl: templateBase + 'invitation/division/invitation-division.html',
            controller: returnCtrlAs('inviteDivision'),
            access:loginRequired
        })
        // Applications ---------------------------------------------
        .state('organization.applications', {
            url: '/organization/applications',
            templateUrl: templateBase + 'applications/organization-applications.html',
            access:loginRequired
        })
        .state('applications.newGrant', {
            url: '/newGrant?userID',
            templateUrl: templateBase + 'applications/newGrant/applications-newGrant.html',
            controller: returnCtrlAs('newGrant'),
            access:loginRequired
        })
        .state('applications.pendingRequests', {
            url: '/pendingRequests?userID&orgID',
            templateUrl: templateBase + 'applications/pendingRequestsReview/applications-pendingRequests.html',
            controller: returnCtrlAs('pendingRequests'),
            access:loginRequired
        })
        .state('applications.pendingRequestsReview', {
            url: '/pendingRequests/review?userID',
            templateUrl: templateBase + 'applications/pendingRequestsReview/applications-pendingRequestsReview.html',
            controller: returnCtrlAs('pendingRequestsReview'),
            access:loginRequired
        });

}]);
