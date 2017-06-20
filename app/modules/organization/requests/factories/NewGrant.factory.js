angular.module('organization')
.factory('NewGrant', (DataStorage, API, $stateParams) => {
    let newGrant = {}
    let newGrantsInStorage
    /*
        This Factory provides common platform to share common logic between granting an app to 
        User and Organization
    */
    // Not handling package requests as not needed
    newGrant.updateStorage = (type,id,application) => {
        let storageType
        if(type==="person") storageType='newGrant'
        else storageType='newOrgGrant'
        DataStorage.setType(storageType, {
            id: id,
            type: type,
            applications: application
        })
        // console.log(DataStorage.getType('newGrant'))
    }

    newGrant.pullFromStorage = (scope,resourceId,type) => {
        // const newGrantsInStorage = DataStorage.getDataThatMatches('newGrant', { userId: $stateParams.userID })
        if (type==="person") {
            newGrantsInStorage = DataStorage.getType('newGrant')
        }
        else{
            newGrantsInStorage = DataStorage.getType('newOrgGrant')
        }      
        if (newGrantsInStorage&&newGrantsInStorage.id==resourceId) {
            scope.appsBeingRequested = Object.assign({}, newGrantsInStorage.applications)
            scope.packagesBeingRequested = Object.assign({}, newGrantsInStorage.packages)
        }
        else {
            scope.packagesBeingRequested = {}
            scope.appsBeingRequested = {}
        }

        scope.numberOfRequests = Object.keys(scope.appsBeingRequested).length + Object.keys(scope.packagesBeingRequested).length

        scope.applicationCheckbox = Object.keys(scope.appsBeingRequested).reduce((applications, appId) => {
            applications[appId] = true
            return applications
        },{})

        scope.packageCheckbox = Object.keys(scope.packagesBeingRequested).reduce((packages, appId) => {
            packages[appId] = true
            return packages
        },{})

        scope.requests = {
            application: scope.appsBeingRequested,
            package: scope.packagesBeingRequested
        }
    }

    newGrant.claimGrants = (id, type,packageRequestObject) => {
        let claimGrants = []

        const buildPackageClaims = (claimsObject) => {
            if (Object.keys(claimsObject).length === 0) {
                return undefined;
            } // if there's no claims in this claim object
            let packageClaims = []
            Object.keys(claimsObject).forEach(claimId => {
                if (Object.keys(claimsObject[claimId]).length === 0) {
                    return;
                } // if no claimValues selected for that claimId
                const claimValues = Object.keys(claimsObject[claimId]).reduce((claims, claimValueId) => {
                    claims.push({ claimValueId })
                    return claims
                },[])

                packageClaims.push({
                    claimId,
                    claimValues
                })
            })
            return packageClaims
        }

        Object.keys(packageRequestObject).forEach(pkgId => {
            claimGrants.push({
                data: {
                    grantee: {
                        id: id,
                        type: type
                    },
                    servicePackage: {
                        id: pkgId,
                        type: 'servicePackage'
                    },
                    packageClaims: buildPackageClaims(packageRequestObject[pkgId].claims)
                }
            })
        })

       return claimGrants
    }

    newGrant.packageGrants = (id, type, packageRequestObject) => {
        let packageGrants = []
        let index=0
        Object.keys(packageRequestObject).forEach(pkgId => {            
            packageGrants.push({
                packageId: pkgId,
                data: {
                    version:'123',
                    status: 'active',
                    grantee: {
                        id: id,
                        type: type
                    },
                    servicePackage: {
                        id: pkgId,
                        type: 'servicePackage'
                    },
                    reason:packageRequestObject[pkgId].reason
                }
            })
            if (type==='person') {
                packageGrants[index].personId=id
            }
            else{
                packageGrants[index].organizationId=id
            }
            index++
        })

        return packageGrants
    }

    return newGrant
})