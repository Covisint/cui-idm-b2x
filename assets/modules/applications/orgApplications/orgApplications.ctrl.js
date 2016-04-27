angular.module('applications')
.controller('orgApplicationsCtrl', ['$scope','API','Sort','$stateParams',
function($scope,API,Sort,$stateParams) {
    'use strict';

    var orgApplications = this;
    var organizationId = $stateParams.id;

    orgApplications.loading = true;
    orgApplications.sortFlag = false;
    orgApplications.categoriesFlag = false;
    orgApplications.statusFlag = false;
    orgApplications.appList = [];
    orgApplications.unparsedAppList = [];
    orgApplications.categoryList = [];
    orgApplications.statusList = ['active', 'suspended', 'pending'];
    orgApplications.statusCount = [0,0,0,0];

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------

    var handleError = function handleError(err) {
        orgApplications.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    var getListOfCategories = function(services) {
        // WORKAROUND CASE # 7
        var categoryList = [];
        var categoryCount = [orgApplications.unparsedAppList.length];

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
        orgApplications.categoryCount = categoryCount;
        return categoryList;
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

                if (i === grants.length) {
                    orgApplications.appList = _.uniq(orgApplications.appList, function(app) {
                        return app.id;
                    });
                    angular.copy(orgApplications.appList, orgApplications.unparsedAppList);
                    orgApplications.statusCount[0] = orgApplications.appList.length;
                    orgApplications.categoryList = getListOfCategories(orgApplications.appList);
                    orgApplications.loading = false;
                    $scope.$digest();
                }
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
    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);
