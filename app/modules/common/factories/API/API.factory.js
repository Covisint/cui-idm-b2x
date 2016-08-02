angular.module('common')
.factory('API', function (APICui, APIHelpers, APIError, APILoader, APIApplications, APIOrganizations) {
    return {
        error: APIError,                        //  API.error.js
        loader: APILoader,                      //  API.loader.js
        helpers: function () {
            return APIHelpers(this)             //  helpers/helpers.js
        },
        applications: function () {
            return APIApplications(this)        //  applications/applications.js
        },
        organizations: function (opts) {
            return APIOrganizations(this, opts) //  organizations/organizations.js
        },
        cui: function () {
            return APICui(this)                  //  cui/cui.js
        },
        cuiUtils: function () {
            return APICui(this).utils            //  cui/cui.js
        }
    }
})