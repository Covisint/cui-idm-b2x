angular.module('common')
.factory('ServicePackage', (API, APIError, $q) => {
    'use strict'

    /*
        This factory was originally used as a type of data storage for storing service package data. The use of this factory
        for storing data is now deprecated in favor of an actual data storage solution in our "DataStorage" factory. 
        The data storage features of this factory will be removed in a future version.

        The focus of this factory will transition to dealing with any other logic associated with service packages.
    */

    const servicePackage = {}
    const errorName = 'ServicePackageFactory.'
    let servicePackageStorage = {}

    /****************************************
                Helper Functions
    ****************************************/

    // Returns services that are associated with a package id
    const getPackageServices = (packageId) => {
        const defer = $q.defer()

        API.cui.getPackageServices({packageId: packageId})
        .done(packageServices => {
            defer.resolve(packageServices)
        })
        .fail(err => {
            console.error('Failed getting package services')
            APIError.onFor(errorName + 'getPackageServices')
            defer.reject(err)
        })
        return defer.promise
    }

    // Returns claims that are associated with a package id
    const getPackageClaims = (packageId) => {
        const defer = $q.defer()

        API.cui.getPackageClaims({qs: [['packageId', packageId]]})
        .done(packageClaims => {
            defer.resolve(packageClaims)
        })
        .fail(err => {
            console.error('Failed getting package claims')
            APIError.onFor(errorName + 'getPackageClaims')
            defer.reject(err)
        })
        return defer.promise
    }

    // Returns all data for a specified package id
    const getPackageDetails = (packageId) => {
        const defer = $q.defer()

        API.cui.getPackage({packageId: packageId})
        .done(packageData => {
            defer.resolve(packageData)
        })
        .fail(err => {
            console.error('Failed getting package details')
            APIError.onFor(errorName + 'getPackageDetails')
            defer.reject(err)
        })
        return defer.promise
    }

    /****************************************
                Service Functions
    ****************************************/

    // Deprecated
    servicePackage.set = (userId, newServicePackageArray) => {
        servicePackageStorage.userId = newServicePackageArray
    }

    // Deprecated
    servicePackage.get = (userId) => {
        return servicePackageStorage.userId
    }

    // Deprecated
    servicePackage.clear = () => {
        servicePackageStorage = {}
    }

    // Deprecated
    servicePackage.checkStorage = (userId) => {
        if (servicePackageStorage.userId) {
            return true
        }
        return false
    }

    // This call wraps the getPackageServices(), getPackageClaims(), and getPackageDetails() calls
    // Returns all relevant data associated with the provided packageId including its services, claims, and details
    servicePackage.getPackageDetails = (packageId) => {
        const defer = $q.defer()
        let packageDetails = {}
        let callsCompleted = 0

        getPackageDetails(packageId)
        .then(packageData => {
            packageDetails.details = packageData
        })
        .finally(() => {
            callsCompleted += 1
            if (callsCompleted === 3) {
                defer.resolve(packageDetails);
            }
        })

        getPackageServices(packageId)
        .then(packageServices => {
            packageDetails.services = packageServices
        })
        .finally(() => {
            callsCompleted += 1
            if (callsCompleted === 3) {
                defer.resolve(packageDetails);
            }
        })

        getPackageClaims(packageId)
        .then(packageClaims => {
            packageDetails.claims = packageClaims
        })
        .finally(() => {
            callsCompleted += 1
            if (callsCompleted === 3) {
                defer.resolve(packageDetails);
            }  
        })

        return defer.promise
    }

    // Returns all packages for the specified userId with a pending status
    servicePackage.getPersonPendingPackages = (userId) => {
        const defer = $q.defer()

        API.cui.getPersonPendingServicePackages({qs: [
            ['requestor.id', userId],
            ['requestor.type', 'person']
        ]})
        .done(servicePackages => {
            defer.resolve(servicePackages)
        })
        .fail(err => {
            console.error('There was an error retrieving pending service packages')
            APIError.onFor(errorName + 'getPendingPackages')
            defer.reject(err)
        })

        return defer.promise
    }

    // This call wraps the service.getPersonPendingServicesPackages() and service.getPackageDetails() calls
    // Returns all relevant data for a user's pending packages
    servicePackage.getAllUserPendingPackageData = (userId) => {
        const defer = $q.defer()
        let pendingPackageData = []

        servicePackage.getPersonPendingPackages(userId)
        .then(pendingPackages => {
            let packageDetailCalls = []

            pendingPackages.forEach(pendingPackage => {
                packageDetailCalls.push(
                    servicePackage.getPackageDetails(pendingPackage.servicePackage.id)
                    .then(packageDetails => {
                        angular.merge(pendingPackage, packageDetails)
                        pendingPackageData.push(pendingPackage)
                    })
                )
            })

            $q.all(packageDetailCalls)
            .then(() => {
                cui.log('packageDetailCalls then', userId, pendingPackageData);
                defer.resolve(pendingPackageData)
            })
            .catch(err => {
                cui.log('packageDetailCalls catch', err);
                defer.reject(err)
            })
        })
        .catch(err => {
            defer.reject(err)
        })

        return defer.promise
    }

    // Handles the approval/denial of a package request
    // The package request must have a property of "approval" with either "approved" or "denied"
    // If the package is denied and the package request has an optional property of "rejectReason", appends the reason to the payload
    servicePackage.handlePackageApproval = (packageRequest) => {
        let data = [['requestId', packageRequest.id]]

        if (packageRequest.approval === 'approved') {
            return API.cui.approvePackage({qs: data})
        }
        else if (packageRequest.approval === 'denied') {
            if (packageRequest.rejectReason) {
                data.push(['justification', packageRequest.rejectReason]);
            }
            return API.cui.denyPackage({qs: data})
        } else {
            throw new Error('Package request object must contain "approval" of either "approved" or "denied"');
        }
    }

    return servicePackage

})
