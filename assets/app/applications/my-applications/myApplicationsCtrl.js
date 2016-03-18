angular.module('app')
.controller('myApplicationsCtrl', ['localStorageService','$scope','$stateParams', 'API','$state',
function(localStorageService,$scope,$stateParams,API,$state){
    'use strict';

    var myApplications = this;

    myApplications.doneLoading = false;
    myApplications.sortFlag = false;
    myApplications.categoriesFlag = false;

    myApplications.list = [];

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error \n\n', err);
    };

    var getDateGranted = function(creationUnixStamp) {
        var dateGranted = new Date(creationUnixStamp);
        var dateGrantedFormatted = dateGranted.getMonth() + '.' + dateGranted.getDay() + '.' + dateGranted.getFullYear();
        return dateGrantedFormatted;
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    // WORKAROUND CASE #1
    var getApplicationsFromGrants = function(grants) { 
    // from the list of grants, get the list of services from each of those service packages
        var i = 0;
        grants.forEach(function(grant) {
            API.cui.getPackageServices({'packageId':grant.servicePackage.id})
            .then(function(res) {
                i++;
                res.forEach(function(service) {
                    service.status = grant.status; // attach the status of the service package to the service
                    service.dateCreated = getDateGranted(grant.creation);
                    service.parentPackage = grant.servicePackage.id;
                    myApplications.list.push(service);
                });
                if(i === grants.length) { // if this is the last grant
                    myApplications.doneLoading = true;
                    $scope.$digest();
                }
            })
            .fail(handleError);
        });
    };

    API.cui.getPersonPackages({personId:API.getUser(), useCuid:true}) // this returns a list of grant
    .then(function(res) {
        getApplicationsFromGrants(res);
    })
    .fail(handleError);

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    myApplications.goToDetails = function(application) {
        $state.go('applications.myApplicationDetails', {'packageId':application.parentPackage, 'appId':application.id});
    };

    myApplications.listSort = function(listToSort, sortType) {
        listToSort.sort(function(a, b) {
            if (sortType === 'alphabetically') { a = a.name[0].text.toUpperCase(), b = b.name[0].text.toUpperCase(); }
            else { a = a.dateCreated, b = b.dateCreated; }

            if (a < b) return -1;
            else if (a > b) return 1;
            else return 0;
        });
    };

    myApplications.listSortReverse = function(listToSort, sortType) {
        listToSort.sort(function(a, b) {
            if (sortType === 'alphabetically') { a = a.name[0].text.toUpperCase(), b = b.name[0].text.toUpperCase(); }
            else { a = a.dateCreated, b = b.dateCreated; }

            if (a > b) return -1;
            else if (a < b) return 1;
            else return 0;
        });
    };

    myApplications.sort = function(sortType) {
        if (myApplications.sortFlag) {
            myApplications.listSortReverse(myApplications.list, sortType);
            myApplications.sortFlag = false;
        }
        else {
            myApplications.listSort(myApplications.list, sortType);
            myApplications.sortFlag = true;
        }
    };

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);
