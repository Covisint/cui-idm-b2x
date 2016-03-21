angular.module('app')
.controller('myApplicationsCtrl', ['localStorageService','$scope','$stateParams', 'API','$state','$filter',
function(localStorageService,$scope,$stateParams,API,$state,$filter) {
    'use strict';

    var myApplications = this;

    myApplications.doneLoading = false;
    myApplications.sortFlag = false;
    myApplications.categoriesFlag = false;

    myApplications.list = [];
    myApplications.unparsedListOfAvailabeApps = [];

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error \n\n', err);
    };

    var getDateGranted = function(creationUnixStamp) {
        var dateGranted = new Date(creationUnixStamp);
        var dateGrantedFormatted = dateGranted.getMonth() + '.' + dateGranted.getDay() + '.' + dateGranted.getFullYear();
        return dateGrantedFormatted;
    };

    var getListOfCategories = function(services) {
        // WORKAROUND CASE # 7
        var categoryList = [[{lang:'en', text:'All'}]];
        var categoryCount = [];

        services.forEach(function(service) {
            if (service.category) {

                var serviceCategoryInCategoryList = _.some(categoryList, function(category, i) {
                    if (angular.equals(category, service.category)) {
                        categoryCount[1] ? categoryCount[1]++ : categoryCount[1] = 1;
                        categoryCount[i+1] ? categoryCount[i+1]++ : categoryCount[i+1] = 1;
                        return true;
                    }
                    return false;
                });

                if (!serviceCategoryInCategoryList) {
                    categoryList.push(service.category);
                    categoryCount[1] ? categoryCount[1]++ : categoryCount[1] = 1;
                    categoryCount[categoryList.length] = 1;
                }
            }
        });
        myApplications.categoryCount = categoryCount;
        return categoryList;
    };

    var listSort = function(listToSort, sortType) {
        listToSort.sort(function(a, b) {
            if (sortType === 'alphabetically') { a = a.name[0].text.toUpperCase(), b = b.name[0].text.toUpperCase(); }
            else { a = a.dateCreated, b = b.dateCreated; }

            if (a < b) return -1;
            else if (a > b) return 1;
            else return 0;
        });
    };

    var listSortReverse = function(listToSort, sortType) {
        listToSort.sort(function(a, b) {
            if (sortType === 'alphabetically') { a = a.name[0].text.toUpperCase(), b = b.name[0].text.toUpperCase(); }
            else { a = a.dateCreated, b = b.dateCreated; }

            if (a > b) return -1;
            else if (a < b) return 1;
            else return 0;
        });
    };

    var categoryFilter = function (app, category) {
        if (!app.category && category) return false;
        if (!category) return true;
        return $filter('cuiI18n')(app.category).indexOf(category) > -1;
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    var getApplicationsFromGrants = function(grants) {
        // WORKAROUND CASE #1
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
                    myApplications.categoryList = getListOfCategories(myApplications.list);
                    angular.copy(myApplications.list, myApplications.unparsedListOfAvailabeApps);
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

    myApplications.sort = function(sortType) {
        if (myApplications.sortFlag) {
            listSortReverse(myApplications.list, sortType);
            myApplications.sortFlag = false;
        }
        else {
            listSort(myApplications.list, sortType);
            myApplications.sortFlag = true;
        }
    };

    myApplications.parseAppsByCategory = function(category) {
        if (category === 'All') {
            myApplications.list = myApplications.unparsedListOfAvailabeApps;
        }
        else {
            var filteredApps = _.filter(myApplications.unparsedListOfAvailabeApps, function(app) {
                return categoryFilter(app, category);
            });
            myApplications.list = filteredApps;
        }
    };

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);
