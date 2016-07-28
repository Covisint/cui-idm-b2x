angular.module('common')
.factory('APIHelpers', (API,$filter) => {

    const apiHelpers = {

        getQs (opts) {
            /**
                return a qs array from an object of key value pairs
                where the key is the search param and the value is the search value (accepts undefined values)
            **/

            return Object.keys(_(opts).omitBy(_.isUndefined).value())
            .reduce((query, param) => {
                return query.concat([[param, opts[param]]])
            }, [])
        },

        buildPackageRequests (arrayOfApps) {
            /**
                returns an array of API package request promises
                based on an array of apps that we want to request

                the reason for the request should be under app._reason
                if it does not have a reason and the service package
                for that app requires one, we return undefined and
                attach an _error property (app._error = true) on that app
            **/

            const numberOfApps = arrayOfApps.length

            if (!_.isArray(arrayOfApps) || numberOfApps === 0) {
                throw new Error ('The argument passed to APIHelpers.buildPackageRequests should be an array of apps, with 1 or more apps.')
                return undefined
            }

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
                            id: API.getUser(),
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
            return packageRequests.map(data => API.cui.createPackageRequest({ data }))
        },

        flattenOrgHierarchy (orgHierarchy) {
            /*
                Takes the organization hierarchy response and returns a flat object array containing the id's and name's of
                the top level organization as well as it's divisions.
            */

            if (orgHierarchy) {
                let organizationArray = [];

                organizationArray.push({
                    id: orgHierarchy.id,
                    name: orgHierarchy.name
                });

                if (orgHierarchy.children) {
                    orgHierarchy.children.forEach((division) => {
                        organizationArray.push({
                            id: division.id,
                            name: division.name
                        });

                        if (division.children) {
                            let flatArray = _.flatten(division.children);
                            
                            flatArray.forEach((childDivision) => {
                                organizationArray.push({
                                    id: childDivision.id,
                                    name: childDivision.name
                                });
                            });
                        }
                    });
                }
                return organizationArray;
            }
            else {
                throw new Error ('No organization hierarchy object provided');
            }
        }
    };

    return apiHelpers

});
