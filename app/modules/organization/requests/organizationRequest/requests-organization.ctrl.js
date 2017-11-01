angular.module('organization')
.controller('organizationRequestCtrl', function(APIError, DataStorage, Loader, $state, $stateParams, $timeout,API,$scope,$q, ServicePackage, PersonAndOrgRequest ) {
    'use strict'

    const organizationRequest = this
    const userId = $stateParams.userId
    const organizationId = $stateParams.orgId

    organizationRequest.approvedCount = 0
    organizationRequest.deniedCount = 0

    organizationRequest.success = false

    // HELPER FUNCTIONS START------------------------------------------------------
    const getApprovalCounts = (requests) => {
        organizationRequest.approvedCount = 0
        organizationRequest.deniedCount = 0
        requests.forEach(request => {
            switch (request.approval) {
                case 'approved':
                    organizationRequest.approvedCount += 1
                    break
                case 'denied':
                    organizationRequest.deniedCount += 1
                    break
            }
        })
    }

    const handleSuccess = (res) => {
        Loader.offFor('organizationRequest.submitting')
            organizationRequest.success = true
            $scope.$digest()
            $timeout(() => {
                $state.go('organization.requests.orgRegistrationRequests')
        }, 3000)  
    }

    const handleError = (err) => {
        console.log(`There was an error in approving org registration ${err}`)
        Loader.offFor('organizationRequest.submitting')
        organizationRequest.error = true
        $scope.$digest()
    }


    let getPackageDetails= () => {
        if (organizationRequest.request.request.packages&&organizationRequest.request.request.packages.length!==0) {
            organizationRequest.request.request.packages.forEach((requestedPackage ,index)=>{
                ServicePackage.getPackageDetails(requestedPackage.id)
                .then(packageData => {
                    requestedPackage=angular.merge(requestedPackage,packageData)
                })
                .catch(err => {
                    APIError.onFor('organizationRequest.packageServices')
                    console.log('There was an error in fetching following package service details' +err)
                    Loader.offFor('organizationRequest.init')
                })
                .finally(() => {
                        if (index===organizationRequest.request.request.packages.length-1) {
                        Loader.offFor('organizationRequest.init')
                    }
                })
            })
        }
        else{
            Loader.offFor('organizationRequest.init')
        }
    }
    // HELPER FUNCTIONS END------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('organizationRequest.init')
    organizationRequest.request=DataStorage.getType('organizationRegRequest')
    if (organizationRequest.request&&organizationRequest.request.organization.id===organizationId) {
        API.cui.getOrganization({organizationId:organizationId})
        .then(res =>{
            organizationRequest.request.organization=res
            if (res.status==='active') {
                APIError.onFor('organizationRequest.noRequest')
                $timeout(() => $state.go('organization.requests.orgRegistrationRequests'), 5000)
            }
            $scope.$digest()
        })
        getPackageDetails()
    }
    else{
        PersonAndOrgRequest.getRegistrationRequestData(userId, organizationId,'organization')
        .then( res => {
            if (!res.request || res.organization.status==='active') {
                APIError.onFor('organizationRequest.noRequest')
                $timeout(() => $state.go('organization.requests.orgRegistrationRequests'), 5000)
            }
            else{
                organizationRequest.request=res
                getPackageDetails()
                Loader.offFor('organizationRequest.init')
            }
        })
    }
    // else if (organizationRequest.request.personData.id!==userId || organizationRequest.request.personData.organization.id!==organizationId) {
    //     APIError.onFor('organizationRequest.noRequest')
    //     Loader.offFor('organizationRequest.init')
    //     $timeout(() => $state.go('organization.requests.orgRegistrationRequests'), 5000)
    // }
    // else{
    //     getAllDetails()
    // }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    organizationRequest.reviewApprovals = () => {
        DataStorage.setType('organizationRegRequest', organizationRequest.request)
        $state.go('organization.requests.organizationRequestReview', { userId: userId, orgId: organizationId })
    }

    organizationRequest.submit = () => {
        Loader.onFor('organizationRequest.submitting')
        if (organizationRequest.request.packages&&organizationRequest.request.packages.length > 0) {
            getApprovalCounts(organizationRequest.request.packages)
        }
        if (organizationRequest.request.request.approval === 'denied'){
            organizationRequest.reviewApprovals()
        }
        //all approval then call registration endpoint directly
        else if (organizationRequest.deniedCount===0) {
            API.cui.approveOrgRegistrationRequest({qs:[['requestId',organizationRequest.request.id]]})
            .then(handleSuccess)
            .fail(handleError)
        }
        else {
            organizationRequest.reviewApprovals()
        }
    }

    // ON CLICK END ----------------------------------------------------------------------------------
})
