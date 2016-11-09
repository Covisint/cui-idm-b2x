angular.module('organization')
.controller('personRequestCtrl', function(APIError, DataStorage, Loader, PersonRequest, ServicePackage, $state, $stateParams, $timeout) {
    'use strict'

    const personRequest = this
    const userId = $stateParams.userId
    const organizationId = $stateParams.orgId

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('personRequest.init')

    PersonRequest.getPersonRegistrationRequestData(userId, organizationId)
    .then(res => {
        if (!res.request) {
            APIError.onFor('personRequest.noRequest')
            $timeout(() => $state.go('organization.directory.userList'), 5000)
        }
        else {
            personRequest.request = res    
            Loader.offFor('personRequest.init')
        }
    })

    ServicePackage.getAllUserPendingPackageData(userId)
    .then(res => {
        personRequest.packages = res
    })

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    personRequest.reviewApprovals = () => {
        DataStorage.setType('userPersonRequest', { personRequest })
        $state.go('organization.requests.personRequestReview', { userId: userId, orgId: organizationId })
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
