angular.module('common')
.factory('applications.buildPackageRequests', () => (API) => {

    const cui = API.cui()[appConfig.cuiObjects[0].name]

    /**
        returns an array of API package request promises
        based on an array of apps that we want to request

        the reason for the request should be under app._reason
        if it does not have a reason and the service package
        for that app requires one, we return undefined and
        attach an _error property (app._error = true) on that app

        usage API.applications().buildPackageRequests(userId, arrayOfApps)
        note: this method alters the arrayOfApps
    **/
    return (userId, arrayOfApps) => {
        if (!_.isArray(arrayOfApps) || arrayOfApps.length === 0) {
            throw new Error ('The argument passed to API.applications().buildPackageRequests should be an array of apps, with 1 or more apps.')
            return undefined
        }
        const numberOfApps = arrayOfApps.length
        let error = false
        for (let i=0; i < numberOfApps; i++) {
            if (arrayOfApps[i].servicePackage.requestReasonRequired && !arrayOfApps[i]._reason) {
                arrayOfApps[i]._error = true
                if(!error) error = true
            }
        }
        if (error) return undefined

        let packagesBeingRequested = []
        let packageRequests = []
        for (let i=0; i < numberOfApps; i++) {
            if (packagesBeingRequested.indexOf(arrayOfApps[i].servicePackage.id) >= 0) {
                // if the service package is already being requested, simply append to the reason.
                // if the app doesn't have a reason and we got to this point then the package
                // doesn't require a reason
                if (arrayOfApps[i]._reason) {
                    packageRequests[packagesBeingRequested.indexOf(arrayOfApps[i].servicePackage.id)].reason +=
                        ('\n' + $filter('translate')('reason-im-requesting') + ' ' +  $filter('cuiI18n')(arrayOfApps[i].name) + ': ' + arrayOfApps[i].name._reason)
                }
            }
            else {
                // cache the ids in another array so that we can look for an existing package request
                // without having to search through the array of requests.
                packagesBeingRequested.push(arrayOfApps[i].servicePackage.id)
                packageRequests.push({
                    requestor: {
                        id: userId,
                        type: 'person'
                    },
                    servicePackage: {
                        id: arrayOfApps[i].servicePackage.id,
                        type: 'servicePackage'
                    },
                    reason: arrayOfApps[i]._reason || ''
                })
            }
        }
        return packageRequests.map(data => cui.createPackageRequest({ data }))
    }
})
