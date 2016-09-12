angular.module('common')
.factory('BuildPackageRequests', (API) => {

    /*
        Helper factory for creating and sending service package requests.

        Usage: BuildPackageRequests(requestorId, requestorType, arrayOfServices)
        Return: Array of API service package request promises
        
        Notes:
            - RequestorType: Whether the requestor is a person or organization (expects 'person' or 'organization')
            - The reason for the request should be under service._reason
            - If no reason is provided and the service package requires a reason, returns undefined and attach
              an _error property (app._error = true) for that service.
            - This factory is not pure (alters the provided array of services)
    */

    return (requestorId, requestorType, arrayOfApps) => {
        const numberOfApps = arrayOfApps.length

        if (!_.isArray(arrayOfApps) || numberOfApps === 0) {
            throw new Error ('The argument passed to BuildPackageRequests should be an array of 1 or more services.')
            return undefined
        }

        let error = false

        for (let i = 0; i < numberOfApps; i += 1) {
            if (arrayOfApps[i].servicePackage.requestReasonRequired && !arrayOfApps[i]._reason) {
                arrayOfApps[i]._error = true
                if (!error) {
                    error = true;
                }
            }
        }

        if (error) {
            return undefined;
        }

        let packagesBeingRequested = []
        let packageRequests = []

        for (let i = 0; i < numberOfApps; i += 1) {
            if (packagesBeingRequested.indexOf(arrayOfApps[i].servicePackage.id) >= 0) {
                // If the service package is already being requested, append service to the request reason
                // If the request doesn't have a reason here, then it is not required for this service package
                if (arrayOfApps[i]._reason) {
                    packageRequests[packagesBeingRequested.indexOf(arrayOfApps[i].servicePackage.id)].reason +=
                        ('\n' + $filter('translate')('reason-im-requesting') + ' ' +  $filter('cuiI18n')(arrayOfApps[i].name) + ': ' + arrayOfApps[i].name._reason)
                }
            }
            else {
                // Cache id's in seperate array to check for existing package requests without having to search through the array of requests.
                packagesBeingRequested.push(arrayOfApps[i].servicePackage.id)
                packageRequests.push({
                    requestor: {
                        id: requestorId,
                        type: requestorType
                    },
                    servicePackage: {
                        id: arrayOfApps[i].servicePackage.id,
                        type: 'servicePackage'
                    },
                    reason: arrayOfApps[i]._reason || ''
                })
            }
        }
        
        return packageRequests.map(data => API.cui.createPackageRequest({ data }))

    }
})
