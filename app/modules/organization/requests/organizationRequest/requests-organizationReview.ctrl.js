angular.module('organization')
.controller('organizationRequestReviewCtrl', function(DataStorage, Loader, ServicePackage, $q, $state, $stateParams, $timeout,APIError,API,$scope) {
    'use strict'

    const organizationRequestReview = this
    const orgId = $stateParams.orgId

    organizationRequestReview.success = false
    organizationRequestReview.approvedCount = 0
    organizationRequestReview.deniedCount = 0

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const getApprovalCounts = (requests) => {
        requests.forEach(request => {
            switch (request.approval) {
                case 'approved':
                    organizationRequestReview.approvedCount += 1
                    break
                case 'denied':
                    organizationRequestReview.deniedCount += 1
                    break
            }
        })
    }

    const handleSuccess = (res) => {
        Loader.offFor('organizationRequestReview.submitting')
            organizationRequestReview.success = true
            $scope.$digest()
            $timeout(() => {
                $state.go('organization.requests.orgRegistrationRequests')
        }, 3000)  
    }

    const handleError = (err) => {
        console.log(`There was an error in approving org registration ${err}`)
        Loader.offFor('organizationRequestReview.submitting')
        organizationRequestReview.error = true
        $scope.$digest()
    }

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('organizationRequestReview.init')

    const requestData = DataStorage.getType('organizationRegRequest')
    if (!requestData) {
        APIError.onFor('organizationRequestReview.noRequest')
        $timeout(() => $state.go('organization.requests.orgRegistrationRequests'), 5000)
    }
    else if (requestData.personData.organization.id!==orgId) {
        APIError.onFor('organizationRequestReview.noRequest')
        $timeout(() => $state.go('organization.requests.orgRegistrationRequests'), 5000)
    }
    else if (requestData.personData.status!=="pending") {
        APIError.onFor('organizationRequestReview.active')
        $timeout(() => $state.go('organization.requests.orgRegistrationRequests'), 5000)
    }
    else{
        Loader.offFor('organizationRequestReview.init')
    }
    organizationRequestReview.packages = requestData.packages
    organizationRequestReview.personData = requestData.personData
    organizationRequestReview.organization = requestData.organization
    organizationRequestReview.request = requestData.request
    organizationRequestReview.justification=requestData.justification
    organizationRequestReview.id=requestData.id
    if (organizationRequestReview.packages&&organizationRequestReview.packages.length > 0) {
    	getApprovalCounts(organizationRequestReview.packages)
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    organizationRequestReview.submit = () => {
        Loader.onFor('organizationRequestReview.submitting')

        if (organizationRequestReview.request.approval === 'denied'){
            API.cui.denyOrgRegistrationRequest({qs:[['requestId',requestData.id],['reason',organizationRequestReview.request.rejectReason]]})
            .then(handleSuccess)
            .fail(handleError)
        }
        //all approval then call registration endpoint directly
        else if (organizationRequestReview.deniedCount===0) {
            API.cui.approveOrgRegistrationRequest({qs:[['requestId',requestData.id]]})
            .then(handleSuccess)
            .fail(handleError)
        }
        else {
            API.cui.approveOrganizationRequests({qs: [['requestId',requestData.registrant.requestId]]})
            .then(res =>{
                let packageRequestCalls = []

                organizationRequestReview.packages.forEach(packageRequest => {
                    packageRequest.id=packageRequest.requestId
                    packageRequestCalls.push(ServicePackage.handlePackageApproval(packageRequest))
                })

                $q.all(packageRequestCalls)
                .then( res =>{
                    Loader.offFor('organizationRequestReview.submitting')
                    organizationRequestReview.success = true
                        $timeout(() => {
                            $state.go('organization.requests.orgRegistrationRequests')
                    }, 3000) 
                })
                .catch(err => {
                    console.log("Org approval success but One or more package approval/denied failed" +err)
                    organizationRequestReview.error = true
                })
            })            
            .fail(handleError)
        }
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
