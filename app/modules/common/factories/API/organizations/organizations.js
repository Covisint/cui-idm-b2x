angular.module('common')
.factory('APIOrganizations', ($q) => function (API, { cuiObjectName,  }) {
    const apiHelpers = API.helpers()
    const cui = API.cui()[cuiObjectName || appConfig.cuiObjects[0].name]

    this.getOrganizationForPerson = (person, opts = {}) => {
        const deferred = $q.defer()
        apiHelpers.getApiCall(cui.getOrganization({
            organizationId: person.organization.id
        }), opts)
        .then(deferred.resolve)
        .catch(deferred.reject)
        return deferred.promise
    }
})