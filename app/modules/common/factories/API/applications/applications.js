angular.module('common')
.factory('APIApplications', [
        'applications.filter',
        'applications.buildPackageRequests',
        'applications.getCategoriesFromApps',
(filter, buildPackageRequests, getCategoriesFromApps) => function (API) {
    return {
        API,
        filter,
        getCategoriesFromApps,
        buildPackageRequests: buildPackageRequests(API)
    }
}])
