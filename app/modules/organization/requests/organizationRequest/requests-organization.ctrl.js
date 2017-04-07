angular.module('organization')
.controller('organizationRequestCtrl', function(APIError, DataStorage, Loader, $state, $stateParams, $timeout,API,$scope,$q, ServicePackage ) {
    'use strict'

    const organizationRequest = this
    const userId = $stateParams.userId
    const organizationId = $stateParams.orgId

    // HELPER FUNCTIONS START------------------------------------------------------
    let getAllDetails= () => {
        let promises=[]
        API.cui.getOrganization({organizationId:organizationId})
        .then(res =>{
            organizationRequest.request.personData.organization=res
            $scope.$digest()
        })
        if (organizationRequest.request.packages&&organizationRequest.request.packages.length!==0) {
            organizationRequest.request.packages.forEach((requestedPackage ,index)=>{
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
                        if (index===organizationRequest.request.packages.length-1) {
                        Loader.offFor('organizationRequest.init')
                    }
                })
            })
            // $q.all(promises)
            // .then(res => {
            //     organizationRequest.packageData =res
                
            // })
            // .catch(err => {
            //     APIError.onFor('organizationRequest.packageServices')
            //     console.log('There was an error in fetching one or more package service details' +err)
            //     Loader.offFor('organizationRequest.init')
            // })
        }
        else{
            Loader.offFor('organizationRequest.init')
        }
    }
    // HELPER FUNCTIONS END------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('organizationRequest.init')
    organizationRequest.request=DataStorage.getType('organizationRegRequest')
    console.log(organizationRequest.request)
    if (!organizationRequest.request) {
        APIError.onFor('organizationRequest.noRequest')
        Loader.offFor('organizationRequest.init')
        $timeout(() => $state.go('organization.requests.orgRegistrationRequests'), 5000)
    }
    else if (organizationRequest.request.personData.id!==userId || organizationRequest.request.personData.organization.id!==organizationId) {
        APIError.onFor('organizationRequest.noRequest')
        Loader.offFor('organizationRequest.init')
        $timeout(() => $state.go('organization.requests.orgRegistrationRequests'), 5000)
    }
    else{
        getAllDetails()
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    organizationRequest.reviewApprovals = () => {
        DataStorage.setType('organizationRegRequest', organizationRequest.request)
        $state.go('organization.requests.organizationRequestReview', { userId: userId, orgId: organizationId })
    }

    // ON CLICK END ----------------------------------------------------------------------------------
})
