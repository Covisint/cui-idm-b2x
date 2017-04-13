angular.module('organization')
.controller('organizationAppRequestReviewCtrl', function(DataStorage, Loader, ServicePackage, $q, $state, $stateParams, $timeout,APIError,API,$scope) {
    'use strict'

    const organizationAppRequestReview = this
    const orgId = $stateParams.orgId

    organizationAppRequestReview.success = false

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const handleSuccess = (res) => {
        Loader.offFor('organizationAppRequestReview.submitting')
        organizationAppRequestReview.success = true
        DataStorage.setType('organizationAppRequest',{})
        $scope.$digest()
            $timeout(() => {
                $state.go('organization.requests.orgAppRequests')
        }, 3000)  
    }

    const handleError = (err) => {
        console.log(`There was an error in approving org app request ${err.responseJSON}`)
        if (err&&err.responseJSON.apiMessage==='The service request does not exist') {
            organizationAppRequestReview.errorMessage='request-approve-or-rejected'
        }else{
            organizationAppRequestReview.errorMessage=undefined
        }
        Loader.offFor('organizationAppRequestReview.submitting')
        organizationAppRequestReview.error = true
        $scope.$digest()
    }

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('organizationAppRequestReview.init')

    const requestData = DataStorage.getType('organizationAppRequest')
    if (!requestData) {
        APIError.onFor('organizationAppRequestReview.noRequest')
        // $timeout(() => $state.go('organization.requests.orgAppRequests'), 5000)
    }
    else if (requestData.personData.organization.id!==orgId) {
        APIError.onFor('organizationAppRequestReview.noRequest')
        // $timeout(() => $state.go('organization.requests.orgAppRequests'), 5000)
    }
    else{
        Loader.offFor('organizationAppRequestReview.init')
    }
    organizationAppRequestReview.packageData = requestData.packageData
    organizationAppRequestReview.personData = requestData.personData
    organizationAppRequestReview.organization = requestData.organization
    organizationAppRequestReview.request = requestData.request
    organizationAppRequestReview.justification=requestData.justification
    organizationAppRequestReview.id=requestData.id

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    organizationAppRequestReview.submit = () => {
        Loader.onFor('organizationAppRequestReview.submitting')
        organizationAppRequestReview.packageData.id=organizationAppRequestReview.id
        ServicePackage.handlePackageApproval(organizationAppRequestReview.packageData)
        .then(handleSuccess)
        .fail(handleError)
        // if (organizationAppRequestReview.packageData.approval === 'approved'){
        //     API.cui.denyOrgRegistrationRequest({qs:[['requestId',requestData.id],['reason',organizationAppRequestReview.request.rejectReason]]})
        //     .then(handleSuccess)
        //     .fail(handleError)
        // }
        // //all approval then call registration endpoint directly
        // else (organizationAppRequestReview.deniedCount===0) {
        //     API.cui.approveOrgRegistrationRequest({qs:[['requestId',requestData.id]]})
        //     .then(handleSuccess)
        //     .fail(handleError)
        // }
        // else {
        //     API.cui.approvePersonRegistration({qs: [['requestId',requestData.registrant.requestId]]})
        //     let packageRequestCalls = []

        //     organizationAppRequestReview.packages.forEach(packageRequest => {
        //         packageRequest.id=packageRequest.requestId
        //         packageRequestCalls.push(ServicePackage.handlePackageApproval(packageRequest))
        //     })

        //     $q.all(packageRequestCalls)
        //     .then( res =>{
        //         Loader.offFor('organizationAppRequestReview.submitting')
        //         organizationAppRequestReview.success = true
        //             $timeout(() => {
        //                 $state.go('organization.requests.orgRegistrationRequests')
        //         }, 3000) 
        //     })
        //     // .catch(handleError)
        // }
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
