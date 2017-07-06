angular.module('organization')
.controller('organizationAppRequestReviewCtrl', function(DataStorage, Loader, ServicePackage, $q, $state, $stateParams, $timeout,APIError,API,$scope) {
    'use strict'

    const organizationAppRequestReview = this
    const orgId = $stateParams.orgId
    const userId = $stateParams.userId

    organizationAppRequestReview.success = false
    organizationAppRequestReview.approvedCount = 0
    organizationAppRequestReview.deniedCount = 0

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const getApprovalCounts = (requests) => {
        requests.forEach(request => {
            switch (request.approval) {
                case 'approved':
                    organizationAppRequestReview.approvedCount += 1
                    break
                case 'denied':
                    organizationAppRequestReview.deniedCount += 1
                    break
            }
        })
    }

    const handleSuccess = (res) => {
        Loader.offFor('organizationAppRequestReview.submitting')
        organizationAppRequestReview.success = true
        DataStorage.deleteType('organizationAppRequest')
            $timeout(() => {
                $state.go('organization.requests.orgAppRequests')
        }, 3000)  
    }

    const handleError = (err) => {
        console.log(`There was an error in approving org app request ${err.responseJSON}`)
        if (err&&err.responseJSON&&err.responseJSON.apiMessage==='The service request does not exist') {
            organizationAppRequestReview.errorMessage='request-approve-or-rejected'
        }else{
            organizationAppRequestReview.errorMessage=undefined
        }
        Loader.offFor('organizationAppRequestReview.submitting')
        organizationAppRequestReview.error = true
    }

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('organizationAppRequestReview.init')

    const requestData = DataStorage.getType('organizationAppRequest')
    if (!requestData || requestData.personData.organization.id!==orgId) {
        $state.go('organization.requests.organizationAppRequest',$stateParams)
    }
    else{
        Loader.offFor('organizationAppRequestReview.init')
    }

    organizationAppRequestReview.packageData = requestData.packageData
    organizationAppRequestReview.personData = requestData.personData
    organizationAppRequestReview.organization = requestData.organization
    getApprovalCounts(organizationAppRequestReview.packageData)
    // organizationAppRequestReview.request = requestData.request
    // organizationAppRequestReview.justification=requestData.justification
    // organizationAppRequestReview.id=requestData.id

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    organizationAppRequestReview.submit = () => {
        Loader.onFor('organizationAppRequestReview.submitting')
        let submitCalls = []
        organizationAppRequestReview.packageData.forEach(packageRequest => {
            submitCalls.push(ServicePackage.handlePackageApproval(packageRequest))
        })

        $q.all(submitCalls)
        .then(handleSuccess)
        .catch(handleError)
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
