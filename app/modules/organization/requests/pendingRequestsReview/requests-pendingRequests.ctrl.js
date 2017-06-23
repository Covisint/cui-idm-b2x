angular.module('organization')
.controller('pendingRequestsCtrl', function(API, DataStorage, Loader, ServicePackage, $q, $state, $stateParams,$timeout) {
    'use strict'

    const pendingRequests = this
    const userId = $stateParams.userId
    const orgId = $stateParams.orgId

    pendingRequests.success = false
    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const getApprovalCounts = (requests) => {
    pendingRequests.approvedCount = 0
    pendingRequests.deniedCount = 0
        requests.forEach(request => {
            switch (request.approval) {
                case 'approved':
                    pendingRequests.approvedCount += 1
                    break
                case 'denied':
                    pendingRequests.deniedCount += 1
                    break
            }
        })
    }

    // HELPER FUNCTIONS END --------------------------------------------------------------------------


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

    pendingRequests.submit = () => {
        let submitCalls = []
        getApprovalCounts(pendingRequests.packages)
        if (pendingRequests.deniedCount===0) {
            pendingRequests.submitting=true
            pendingRequests.packages.forEach(packageRequest => {
                submitCalls.push(ServicePackage.handlePackageApproval(packageRequest))
            })

            $q.all(submitCalls)
            .then(() => {
                pendingRequests.success = true
                pendingRequests.submitting=false
                $timeout(() => {
                    $state.go('organization.requests.usersAppRequests')
                }, 3000)
            })
            .catch(err => {
                pendingRequests.submitting=false
                console.log("There was an error in approving application requests" + err);
                pendingRequests.error=true
            })
        }
        else{
            pendingRequests.reviewApprovals()
        }
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
