angular.module('app')
.controller('newAppRequestCtrl',['API','$scope','$state','AppRequests',
function(API,$scope,$state,AppRequests) {
    'use strict';
    var newAppRequest = this;

    var user;
    var services = [];
    var appsBeingRequested = AppRequests.get();

    newAppRequest.numberOfRequests = 0;
    newAppRequest.appsBeingRequested = [];

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function(err) {
        console.log('Error\n', err);
    };

    var getListOfCategories = function(services) {
        // WORKAROUND CASE # 7
        var categoryList = [];

        services.forEach(function(service) {
            if (service.category) {
                var serviceCategoryInCategoryList = _.some(categoryList, function(category) {
                    return angular.equals(category, service.category);
                });

                if (!serviceCategoryInCategoryList) {
                    categoryList.push(service.category);
                }
            }
        });
        return categoryList;
    };

    Object.keys(appsBeingRequested).forEach(function(appId) {
        // This sets the checkboxes back to marked when the user clicks back
        newAppRequest.numberOfRequests++;
        newAppRequest.appsBeingRequested.push(appsBeingRequested[appId]);
    });

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    API.cui.getRequestablePersonPackages({personId: API.getUser(), useCuid:true})
    .then(function(res) {
        var i = 0;
        var packages = res;

        packages.forEach(function(pkg) {
            API.cui.getPackageServices({'packageId':pkg.id})
            .then(function(res) {
                i++;
                res.forEach(function(service) {
                    services.push(service);
                });
                if (i === packages.length) {
                    newAppRequest.categories = getListOfCategories(services);
                    newAppRequest.loadingDone = true;
                    $scope.$digest();
                }
            })
            .fail(function() {
                i++;
                if (i === packages.length) {
                    newAppRequest.categories = getListOfCategories(services);
                    newAppRequest.loadingDone = true;
                    $scope.$digest();
                }
            });
        });
    })
   .fail(handleError);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    newAppRequest.searchCallback = function(searchWord) {
        $state.go('applications.search', {name: searchWord});
    };

    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
