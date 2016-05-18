angular.module('applications')
.controller('myApplicationsCtrl', ['$scope','API','Sort','$stateParams',
function($scope,API,Sort,$stateParams) {
    'use strict';

    var myApplications = this;
    var organizationId = $stateParams.id;

    myApplications.appList = [];
    myApplications.unparsedAppList = [];

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    var handleError = function handleError(err) {
        myApplications.loading = false;
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

                    myApplications.appList.push(service);
                });

                if (i === grants.length) {
                    myApplications.appList = _.uniq(myApplications.appList, function(app) {
                        return app.id;
                    });
                    angular.copy(myApplications.appList, myApplications.unparsedAppList);
                    myApplications.doneLoading = true;
                    $scope.$digest();
                }
            })
            .fail(handleError);
        });
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    API.cui.getPersonPackages({ personId: API.getUser(), useCuid:true })
    .then(function(res) {
        getApplicationsFromGrants(res);
    })
    .fail(handleError);

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    let alphabeticalFlag = false;
    let dateFlag = false;

    myApplications.updateSearch = (type,value) => {
        switch(type){
            case 'alphabetic':
                Sort.listSort(myApplications.appList,'alphabetically',alphabeticalFlag);
                alphabeticalFlag =! alphabeticalFlag;
                break;
            case 'date':
                Sort.listSort(myApplications.appList,'date',dateFlag);
                dateFlag =! dateFlag;
                break;
            case 'status':
                if(!value) angular.copy(myApplications.unparsedAppList, myApplications.appList);
                else {
                    myApplications.appList  = myApplications.unparsedAppList.filter(x => x.status===value);
                }
        };
    }

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);
