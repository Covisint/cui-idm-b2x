angular.module('organization')
.controller('pendingRequestsReviewCtrl', function(DataStorage, Loader, ServicePackage, $q, $state, $stateParams, $timeout) {
    'use strict'

    const pendingRequestsReview = this
    const userId = $stateParams.userID
    const orgId = $stateParams.orgID

    pendingRequestsReview.success = false
    pendingRequestsReview.approvedCount = 0
    pendingRequestsReview.deniedCount = 0

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const getApprovalCounts = (requests) => {
        requests.forEach(request => {
            switch (request.approval) {
                case 'approved':
                    pendingRequestsReview.approvedCount++
                    break
                case 'denied':
                    pendingRequestsReview.deniedCount++
                    break
            }
        })
    }

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('pendingRequestsReview.init')

    const requestData = DataStorage.getDataThatMatches('appRequests', { userId })[0].data

    pendingRequestsReview.pendingRequests = requestData.packages
    pendingRequestsReview.user = requestData.user

    if (pendingRequestsReview.pendingRequests.length > 0) getApprovalCounts(pendingRequestsReview.pendingRequests)

    Loader.offFor('pendingRequestsReview.init')

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    pendingRequestsReview.submit = () => {
        let submitCalls = []

        pendingRequestsReview.pendingRequests.forEach(packageRequest => {
            submitCalls.push(ServicePackage.handlePackageApproval(packageRequest))
        })

        $q.all(submitCalls)
        .then(() => {
            pendingRequestsReview.success = true
            $timeout(() => {
                $state.go('organization.directory.userDetails', {userID: userId, orgID: orgId})
            }, 3000)
        })
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
