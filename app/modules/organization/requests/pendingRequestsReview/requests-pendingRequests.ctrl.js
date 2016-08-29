angular.module('organization')
.controller('pendingRequestsCtrl', function(API, DataStorage, Loader, ServicePackage, $q, $state, $stateParams) {
    'use strict'

    const pendingRequests = this
    const userId = $stateParams.userID
    const orgId = $stateParams.orgID

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
        
        DataStorage.replaceDataThatMatches('appRequests', { userId }, { userId, data: storageData })
        $state.go('organization.requests.pendingRequestsReview', {userID: userId, orgID: orgId})
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
