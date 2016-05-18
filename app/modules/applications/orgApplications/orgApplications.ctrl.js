angular.module('applications')
.controller('orgApplicationsCtrl', ['$scope','API','Sort','$stateParams',
function($scope,API,Sort,$stateParams) {
    'use strict';

    var orgApplications = this;
    var organizationId = $stateParams.id;

    orgApplications.appList = [];
    orgApplications.unparsedAppList = [];

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    var handleError = function handleError(err) {
        orgApplications.doneLoading = true;
        $scope.$digest();
        console.log('Error', err);
    };

    var getApplicationsFromGrants = function(grants) {
        // WORKAROUND CASE #1
        // Get services from each grant
        var i = 0;
        grants.forEach(function(grant) {
            API.cui.getPackageServices({ 'packageId': grant.servicePackage.id })
            .then(function(res) {
                i++;
                res.forEach(function(service) {
                    // Set some of the grant attributes to its associated service
                    service.status = grant.status;
                    service.dateCreated = grant.creation;
                    service.parentPackage = grant.servicePackage.id;
                    orgApplications.appList.push(service);
                });

                orgApplications.appList = _.uniq(orgApplications.appList, function(app) {
                    return app.id;
                });
                angular.copy(orgApplications.appList, orgApplications.unparsedAppList);
                orgApplications.doneLoading = true;
                $scope.$digest();
            })
            .fail(handleError);
        });
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    if (organizationId) {
        // Load organization applications of id parameter
        API.cui.getOrganizationPackages({ organizationId: organizationId })
        .then(function(res) {
            getApplicationsFromGrants(res);
        })
        .fail(handleError);
    }
    else {
        // Load logged in user's organization applications
        API.cui.getPerson({ personId: API.getUser(), useCuid:true })
        .then(function(res) {
            return API.cui.getOrganizationPackages({ organizationId: res.organization.id });
        })
        .then(function(res) {
            getApplicationsFromGrants(res);
        })
        .fail(handleError);
    }

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------


    let alphabeticalFlag = false;
    let dateFlag = false;

    orgApplications.updateSearch = (type,value) => {
        switch(type){
            case 'alphabetic':
                Sort.listSort(orgApplications.appList,'alphabetically',alphabeticalFlag);
                alphabeticalFlag =! alphabeticalFlag;
                break;
            case 'date':
                Sort.listSort(orgApplications.appList,'date',dateFlag);
                dateFlag =! dateFlag;
                break;
            case 'status':
                if(!value) angular.copy(orgApplications.unparsedAppList, orgApplications.appList);
                else {
                    orgApplications.appList  = orgApplications.unparsedAppList.filter(x => x.status===value);
                }
        };
    }

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);
