angular.module('organization')
.factory('NewGrant', (DataStorage, API, $stateParams) => {
    let newGrant = {}

    newGrant.pullFromStorage = (scope) => {
        const newGrantsInStorage = DataStorage.getDataThatMatches(API.getUser(), 'newGrant', { userId: $stateParams.userID })
        if (newGrantsInStorage) {
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

    newGrant.buildGrantRequests = (userId, packageRequestObject) => {
        let grantRequests = []

        const buildPackageClaims = (claimsObject) => {
            if (Object.keys(claimsObject).length === 0) return undefined // if there's no claims in this claim object
            let packageClaims = []
            Object.keys(claimsObject).forEach(claimId => {
                if (Object.keys(claimsObject[claimId]).length === 0) return // if no claimValues selected for that claimId
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
            grantRequests.push({
                grantee: {
                    id: userId,
                    type: 'person'
                },
                servicePackage: {
                    id: pkgId
                },
                packageClaims: buildPackageClaims(packageRequestObject[pkgId].claims)
            })
        })

       return grantRequests
    }

    return newGrant
})