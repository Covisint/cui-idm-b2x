angular.module('applications')
.controller('myApplicationsCtrl', ['localStorageService','$scope','$stateParams','API','$state','$filter','Sort',
function(localStorageService,$scope,$stateParams,API,$state,$filter,Sort) {
    'use strict';

    var myApplications = this;

    var stepsDone = 0,
        stepsRequired = 2;

    myApplications.doneLoading = false;
    myApplications.sortFlag = false;
    myApplications.categoriesFlag = false;
    myApplications.statusFlag = false;
    myApplications.list = [];
    myApplications.unparsedListOfAvailabeApps = [];
    myApplications.statusList = ['active', 'suspended', 'pending'];
    myApplications.statusCount = [0,0,0,0];

    

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error \n\n', err);
    };

    var updateStatusCount = function(service) {
        if (service.status && myApplications.statusList.indexOf(service.status) > -1) {
            myApplications.statusCount[myApplications.statusList.indexOf(service.status)+1]++;
        }
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

    var checkIfDone = function() {
        stepsDone++;
        if (stepsDone === stepsRequired) {
            myApplications.list = _.uniqBy(myApplications.list, 'id');

            myApplications.list.forEach(function(service) {
                updateStatusCount(service);
            });

            angular.copy(myApplications.list, myApplications.unparsedListOfAvailabeApps);
            // Set refine/categories:all to the number of total apps
            myApplications.statusCount[0] = myApplications.list.length;
            myApplications.categoryList = getListOfCategories(myApplications.list);
            myApplications.doneLoading = true;
            $scope.$digest();
        }
    };

    var getApplicationsFromGrants = function(grants) {
        // WORKAROUND CASE #1
        // from the list of grants, get the list of services from each of those service packages
        var i = 0;
        if (grants.length === 0) {
            checkIfDone();
            return;
        }
        grants.forEach(function(grant) {
            API.cui.getPackageServices({'packageId':grant.servicePackage.id})
            .then(function(res) {
                i++;
                res.forEach(function(service) {
                    service.status = grant.status; // attach the status of the service package to the service
                    service.dateCreated = grant.creation;
                    service.parentPackage = grant.servicePackage.id;
                    myApplications.list.push(service);
                });

                if (i === grants.length) { // if this is the last grant
                    checkIfDone();
                }
            })
            .fail(handleError);
        });
    };

    var getApplicationsFromPendingRequests = function(requests) {
        var i = 0;
        if (requests.length === 0) {
            checkIfDone();
            return;
        }
        requests.forEach(function(request) {
            API.cui.getPackageServices({'packageId':request.servicePackage.id})
            .then(function(res) {
                i++;
                res.forEach(function(service) {
                    service.status = 'pending';
                    service.dateCreated = request.creation;
                    service.parentPackage = request.servicePackage.id;
                    myApplications.list.push(service);
                });
                if (i === requests.length) {
                    checkIfDone();
                }
            })
            .fail(handleError);
        });
    };

    var categoryFilter = function (app, category) {
        if (!app.category && category) return false;
        if (!category) return true;
        return $filter('cuiI18n')(app.category)===$filter('cuiI18n')(category);
    };

    var disableAppLaunch = function (status) {
        if (status == 'active') return false;
        else return true;
    };

    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    API.cui.getPersonPackages({personId:API.getUser(), useCuid:true, pageSize:200}) // this returns a list of grants
    .then(function(res) {
        getApplicationsFromGrants(res);
    })
    .fail(handleError);

    API.cui.getPackageRequests({'requestor.id':API.getUser(),'requestor.type':'person', pageSize:200})
    .then(function(res){
        getApplicationsFromPendingRequests(res);
    })
    .fail(handleError);

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------

    myApplications.goToDetails = function(application) {
        $state.go('applications.myApplicationDetails', {'packageId':application.parentPackage, 'appId':application.id});
    };

    myApplications.sort = function(sortType) {
        Sort.listSort(myApplications.list, sortType, myApplications.sortFlag);
        myApplications.sortFlag =! myApplications.sortFlag;
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

    myApplications.parseAppsByStatus = function(status) {
        if (status === 'all') {
            myApplications.list = myApplications.unparsedListOfAvailabeApps;
        }
        else {
            var filteredApps = _.filter(myApplications.unparsedListOfAvailabeApps, function(app) {
                return app.status === status;
            });
            myApplications.list = filteredApps;
        }
    };

    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);
