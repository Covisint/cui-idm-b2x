angular.module('organization')
.controller('organizationAppRequestCtrl', function(APIError, DataStorage, Loader, $state, $stateParams, $timeout,API,$scope,$q, ServicePackage ) {
    'use strict'

    const organizationAppRequest = this
    const userId = $stateParams.userId
    const organizationId = $stateParams.orgId

    organizationAppRequest.success = false
    organizationAppRequest.approvedCount = 0
    organizationAppRequest.deniedCount = 0
    // HELPER FUNCTIONS START------------------------------------------------------
    const getApprovalCounts = (requests) => {
        organizationAppRequest.approvedCount = 0
        organizationAppRequest.deniedCount = 0
        requests.forEach(request => {
            switch (request.approval) {
                case 'approved':
                    organizationAppRequest.approvedCount += 1
                    break
                case 'denied':
                    organizationAppRequest.deniedCount += 1
                    break
            }
        })
    }

    const handleSuccess = (res) => {
        Loader.offFor('organizationAppRequest.submitting')
        organizationAppRequest.success = true
        DataStorage.deleteType('organizationAppRequest')
            $timeout(() => {
                $state.go('organization.requests.orgAppRequests')
        }, 3000)  
    }

    const handleError = (err) => {
        console.log(`There was an error in approving org app request ${err.responseJSON}`)
        if (err&&err.responseJSON&&err.responseJSON.apiMessage==='The service request does not exist') {
            organizationAppRequest.errorMessage='request-approve-or-rejected'
        }else{
            organizationAppRequest.errorMessage=undefined
        }
        Loader.offFor('organizationAppRequest.submitting')
        organizationAppRequest.error = true
    }
    // HELPER FUNCTIONS END------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('organizationAppRequest.init')

    $q.all([
        API.cui.getPerson({personId: userId}),
        API.cui.getOrganization({organizationId: organizationId}),
        ServicePackage.getAllPendingPackageData(organizationId,'organization')
    ])
    .then(res => {
        organizationAppRequest.request={}
        organizationAppRequest.request.personData=res[0]
        organizationAppRequest.request.organization=res[1]
        organizationAppRequest.request.packageData=res[2]
        Loader.offFor('organizationAppRequest.init')
    })
    .catch(err => {
        APIError.onFor('organizationAppRequest.noRequest')
        Loader.offFor('organizationAppRequest.init')
        console.log('There was an error in initializing this page' + err)
    })
    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    organizationAppRequest.reviewApprovals = () => {
        DataStorage.setType('organizationAppRequest', organizationAppRequest.request)
        $state.go('organization.requests.organizationAppRequestReview', { userId: userId, orgId: organizationId })
    }

    organizationAppRequest.submit = () => {
        getApprovalCounts(organizationAppRequest.request.packageData)
        Loader.onFor('organizationAppRequest.submitting')
        if (organizationAppRequest.deniedCount===0) {
            let submitCalls = []
            organizationAppRequest.request.packageData.forEach(packageRequest => {
                submitCalls.push(ServicePackage.handlePackageApproval(packageRequest))
            })

            $q.all(submitCalls)
            .then(handleSuccess)
            .catch(handleError)
        }
        else{
            organizationAppRequest.reviewApprovals()
        }
        
    }
    // ON CLICK END ----------------------------------------------------------------------------------
})
