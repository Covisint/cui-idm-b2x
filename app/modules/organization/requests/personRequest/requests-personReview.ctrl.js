angular.module('organization')
.controller('personRequestReviewCtrl', function(DataStorage, Loader, PersonAndOrgRequest, ServicePackage, $q, $state, $stateParams, $timeout,API,$scope) {
    'use strict'

    const personRequestReview = this
    const userId = $stateParams.userId
    const orgId = $stateParams.orgId

    personRequestReview.success = false
    personRequestReview.approvedCount = 0
    personRequestReview.deniedCount = 0

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const getApprovalCounts = (requests) => {
        requests.forEach(request => {
            switch (request.approval) {
                case 'approved':
                    personRequestReview.approvedCount += 1
                    break
                case 'denied':
                    personRequestReview.deniedCount += 1
                    break
            }
        })
    }

    const handleSuccess = (res) => {
        Loader.offFor('personRequestReview.submitting')
            personRequestReview.success = true
            DataStorage.deleteType('userPersonRequest')
            $scope.$digest()
            $timeout(() => {
                $state.go('organization.requests.usersRegistrationRequests')
        }, 3000)  
    }

    const handleError = (err) => {
        console.log(`There was an error in approving user registration ${err}`)
        Loader.offFor('personRequestReview.submitting')
        personRequestReview.error = true
        $scope.$digest()
    }
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const requestData = DataStorage.getType('userPersonRequest')
    if (requestData&&requestData.request.registrant.id===userId) {
        personRequestReview.packages = requestData.completePackageData
        personRequestReview.personData = requestData.personData
        personRequestReview.organization = requestData.organization
        personRequestReview.request = requestData.request

        if (personRequestReview.packages.length > 0) {
            getApprovalCounts(personRequestReview.packages)
        }
    }
    else{
        $state.go('organization.requests.personRequest',{userId:userId, orgId:orgId})
    }

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    personRequestReview.submit = () => {
        Loader.onFor('personRequestReview.submitting')

        if (personRequestReview.request.approval==='denied') {
            API.cui.denyPersonRegistrationRequest({qs:[['requestId',personRequestReview.request.id],['reason',personRequestReview.request.rejectReason|""]]})
            .then(handleSuccess)
            .fail(handleError)
        }
        else if (personRequestReview.deniedCount===0) {
            API.cui.approvePersonRegistrationRequest({qs:[['requestId',personRequestReview.request.id]]})
            .then(handleSuccess)
            .fail(handleError)
        }
        else{
            API.cui.approvePersonRequest({qs:[['requestId',personRequestReview.request.registrant.requestId||personRequestReview.request.id]]})
            .then(res => {
                let packageRequestCalls = []

                personRequestReview.packages.forEach(packageRequest => {
                    packageRequestCalls.push(ServicePackage.handlePackageApproval(packageRequest))
                })

                $q.all(packageRequestCalls)
                .then(() => {
                    Loader.offFor('personRequestReview.submitting')
                    personRequestReview.success = true
                    DataStorage.deleteType('userPersonRequest')
                    $timeout(() => {
                        $state.go('organization.requests.usersRegistrationRequests')
                    }, 3000)  
                })
                .catch(err => {
                    console.log("User approval successful but there was an error approving/denying package requests" +err)
                    personRequestReview.error = true
                    personRequestReview.errorMessage="app-approval-error"
                })
            })
            .fail(handleError)
        }        
    }

    // ON CLICK END ----------------------------------------------------------------------------------

})
