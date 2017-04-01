angular.module('organization')
.controller('organizationRequestCtrl', function(APIError, DataStorage, Loader, PersonRequest, ServicePackage, $state, $stateParams, $timeout,API) {
    'use strict'

    const organizationRequest = this
    const userId = $stateParams.userId
    const organizationId = $stateParams.orgId

    // HELPER FUNCTIONS START------------------------------------------------------
    let getAllDetails= () => {
        API.cui.getOrganization({organizationId:organizationId})
        .then(res =>{
            Loader.offFor('organizationRequest.init')
            organizationRequest.request.personData.organization=res
        })

        ServicePackage.getAllUserPendingPackageData(organizationId)
        .then(res => {
            organizationRequest.packages = res
        })
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
