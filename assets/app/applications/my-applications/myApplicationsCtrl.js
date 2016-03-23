angular.module('app')
.controller('myApplicationsCtrl', ['localStorageService','$scope','$stateParams', 'API','$state','$filter','Helper',
function(localStorageService,$scope,$stateParams,API,$state,$filter,Helper) {
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

    var getListOfCategories = function(services) {
        // WORKAROUND CASE # 7
        var categoryList = [];
        var categoryCount = [myApplications.unparsedListOfAvailabeApps.length];

        services.forEach(function(service) {
            if (service.category) {
                var serviceCategoryInCategoryList = _.some(categoryList, function(category, i) {
                    if (angular.equals(category, service.category)) {
                        categoryCount[i+1] ? categoryCount[i+1]++ : categoryCount[i+1] = 1;
                        return true;
                    }
                    return false;
                });

                if (!serviceCategoryInCategoryList) {
                    categoryList.push(service.category);
                    categoryCount[categoryList.length] = 1;
                }
            }
        });
        myApplications.categoryCount = categoryCount;
        return categoryList;
    };

    var listSort = function(listToSort, sortType, order) { // order is a boolean
        listToSort.sort(function(a, b) {
            if (sortType === 'alphabetically') { a = $filter('cuiI18n')(a.name).toUpperCase(), b = $filter('cuiI18n')(b.name).toUpperCase(); }
            else { a = a.dateCreated, b = b.dateCreated; }

            if ( a < b ) {
                if (order) return 1;
                else return -1
            }
            else if( a > b ) {
                if (order) return -1;
                else return 1;
            }
            else return 0;
        });
    };

    var categoryFilter = function (app, category) {
        if (!app.category && category) return false;
        if (!category) return true;
        return $filter('cuiI18n')(app.category)===$filter('cuiI18n')(category);
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
                    service.dateCreated = Helper.getDateFromUnixStamp(grant.creation);
                    service.parentPackage = grant.servicePackage.id;
                    myApplications.list.push(service);
                });
                if (i === grants.length) { // if this is the last grant
                    angular.copy(myApplications.list, myApplications.unparsedListOfAvailabeApps);
                    myApplications.categoryList = getListOfCategories(myApplications.list);
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
        listSort(myApplications.list, sortType, myApplications.sortFlag);
        myApplications.sortFlag=!myApplications.sortFlag;
    };

    myApplications.parseAppsByCategory = function(category) {
        if (category === 'all') {
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
