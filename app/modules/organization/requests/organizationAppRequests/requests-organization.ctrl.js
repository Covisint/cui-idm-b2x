angular.module('organization')
.controller('organizationAppRequestCtrl', function(APIError, DataStorage, Loader, $state, $stateParams, $timeout,API,$scope,$q, ServicePackage ) {
    'use strict'

    const organizationAppRequest = this
    const userId = $stateParams.userId
    const organizationId = $stateParams.orgId

    // HELPER FUNCTIONS START------------------------------------------------------
    let getAllDetails= () => {
        let promises=[]
        API.cui.getOrganization({organizationId:organizationId})
        .then(res =>{
            organizationAppRequest.request.personData.organization=res
            $scope.$digest()
        })
        if (organizationAppRequest.request.packageData) {
            ServicePackage.getPackageDetails(organizationAppRequest.request.packageData.id)
            .then(packageData => {
                organizationAppRequest.request.packageData=angular.merge(organizationAppRequest.request.packageData,packageData)
            })
            .catch(err => {
                APIError.onFor('organizationAppRequest.packageServices')
                console.log('There was an error in fetching following package service details' +err)
            })
            .finally(() => {
                Loader.offFor('organizationAppRequest.init')
            })
        }
        else{
            Loader.offFor('organizationAppRequest.init')
        }
    }
    // HELPER FUNCTIONS END------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('organizationAppRequest.init')
    organizationAppRequest.request=DataStorage.getType('organizationAppRequest')
    console.log(organizationAppRequest.request)
    if (!organizationAppRequest.request) {
        APIError.onFor('organizationAppRequest.noRequest')
        Loader.offFor('organizationAppRequest.init')
        $timeout(() => $state.go('organization.requests.orgAppRequests'), 5000)
    }
    else if (organizationAppRequest.request.personData.id!==userId || organizationAppRequest.request.personData.organization.id!==organizationId) {
        APIError.onFor('organizationAppRequest.noRequest')
        Loader.offFor('organizationAppRequest.init')
        $timeout(() => $state.go('organization.requests.orgAppRequests'), 5000)
    }
    else{
        getAllDetails()
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    organizationAppRequest.reviewApprovals = () => {
        DataStorage.setType('organizationRegRequest', organizationAppRequest.request)
        $state.go('organization.requests.organizationAppRequestReview', { userId: userId, orgId: organizationId })
    }

    // ON CLICK END ----------------------------------------------------------------------------------
})
