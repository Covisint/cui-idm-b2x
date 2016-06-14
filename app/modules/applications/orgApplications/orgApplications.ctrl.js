angular.module('applications')
.controller('orgApplicationsCtrl', function(API,Sort,User,$scope,$stateParams,$q) {
    'use strict';

    const orgApplications = this;
    const organizationId = User.user.organization.id;

    let apiPromises = [];

    orgApplications.loading = true;

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------
    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    apiPromises.push(

        API.cui.getOrganizationGrantedApps({organizationId: organizationId})
        .then((res) => {
            console.log(res);
            orgApplications.appList = res;
            orgApplications.unparsedAppList = res;
        }),

        API.cui.getOrganizationGrantedCount({organizationId: organizationId})
        .then((res) => {
            orgApplications.grantedCount = res;
        }),

        API.cui.getOrganizationRequestableApps({organizationId: organizationId})
        .then((res) => {
            orgApplications.requestableApps = res;
        }),

        API.cui.getOrganizationRequestableCount({organizationId: organizationId})
        .then((res) => {
            orgApplications.requestableCount = res;
        })
    );

    $q.all(apiPromises)
    .then(() => {
        orgApplications.loading = false;
    })
    .catch((err) => {
        console.log(err);
    });

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------
    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

});
