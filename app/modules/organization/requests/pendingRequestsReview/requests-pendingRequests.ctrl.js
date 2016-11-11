angular.module('organization')
.controller('pendingRequestsCtrl', function(API, DataStorage, Loader, ServicePackage, $q, $state, $stateParams) {
    'use strict'

    const pendingRequests = this
    const userId = $stateParams.userId
    const orgId = $stateParams.orgId

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('pendingRequests.init')

    $q.all([
        API.cui.getPerson({personId: userId}),
        ServicePackage.getAllUserPendingPackageData(userId)
    ])
    .then(res => {
        pendingRequests.user = res[0]
        pendingRequests.packages = res[1]
        Loader.offFor('pendingRequests.init')
    })

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    pendingRequests.reviewApprovals = () => {
        const storageData = {
            user: pendingRequests.user,
            packages: pendingRequests.packages   
        }
        
        DataStorage.setType('appRequests', storageData)
        $state.go('organization.requests.pendingRequestsReview', { userId: userId, orgId: orgId })
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
