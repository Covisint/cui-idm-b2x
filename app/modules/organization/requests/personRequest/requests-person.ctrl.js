angular.module('organization')
.controller('personRequestCtrl', function(APIError, DataStorage, Loader, PersonRequest, ServicePackage, $state, $stateParams, $timeout,API,$scope) {
    'use strict'

    const personRequest = this
    const userId = $stateParams.userId
    const organizationId = $stateParams.orgId

    personRequest.success = false


    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const getApprovalCounts = (requests) => {
        personRequest.approvedCount = 0
        personRequest.deniedCount = 0
        requests.forEach(request => {
            switch (request.approval) {
                case 'approved':
                    personRequest.approvedCount += 1
                    break
                case 'denied':
                    personRequest.deniedCount += 1
                    break
            }
        })
    }

    const handleSuccess = (res) => {
        Loader.offFor('personRequest.submitting')
            personRequest.success = true
            API.user.userRegistrationRequestsCount=API.user.userRegistrationRequestsCount-1
            $scope.$digest()
            $timeout(() => {
                $state.go('organization.requests.usersRegistrationRequests')
        }, 3000)  
    }

    const handleError = (err) => {
        console.log(`There was an error in approving user registration ${err}`)
        Loader.offFor('personRequest.submitting')
        personRequest.error = true
        $scope.$digest()
    }
    // HELPER FUNCTIONS END --------------------------------------------------------------------------


    // ON LOAD START ---------------------------------------------------------------------------------

    Loader.onFor('personRequest.init')

    PersonRequest.getPersonRegistrationRequestData(userId, organizationId)
    .then(res => {
        if (!res.request) {
            APIError.onFor('personRequest.noRequest')
            $timeout(() => $state.go('organization.requests.usersRegistrationRequests'), 5000)
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
    .catch(err => {
        APIError.onFor('personRequest.noRequest')
        $timeout(() => $state.go('organization.requests.usersRegistrationRequests'), 5000)
    })

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    personRequest.reviewApprovals = () => {
        DataStorage.setType('userPersonRequest', { personRequest })
        $state.go('organization.requests.personRequestReview', { userId: userId, orgId: organizationId })
    }

    personRequest.submit = () => {
        Loader.onFor('personRequest.submitting')
        if (personRequest.packages&&personRequest.packages.length > 0) {
            getApprovalCounts(personRequest.packages)
        }
        if (personRequest.request.request.approval==='denied') {
            //To enter denied Reason
            personRequest.reviewApprovals()
            // API.cui.denyPersonRegistrationRequest({qs:[['requestId',personRequest.request.request.id],['reason',personRequestReview.request.rejectReason|""]]})
            // .then(handleSuccess)
            // .fail(handleError)
        }
        else if (personRequest.deniedCount===0) {
            API.cui.approvePersonRegistrationRequest({qs:[['requestId',personRequest.request.request.id]]})
            .then(handleSuccess)
            .fail(handleError)
        }
        else{
            //To enter denied Reason
            personRequest.reviewApprovals()
            // API.cui.approvePersonRequest({qs:[['requestId',personRequest.request.request.registrant.requestId||personRequestReview.request.id]]})
            // .then(res => {
            //     let packageRequestCalls = []

            //     personRequest.packages.forEach(packageRequest => {
            //         packageRequestCalls.push(ServicePackage.handlePackageApproval(packageRequest))
            //     })

            //     $q.all(packageRequestCalls)
            //     .then(() => {
            //         Loader.offFor('personRequest.submitting')
            //         personRequest.success = true
            //         $timeout(() => {
            //             $state.go('organization.requests.usersRegistrationRequests')
            //         }, 3000)  
            //     })
            //     .catch(err => {
            //         console.log("User approval successful but there was an error approving/denying package requests" +err)
            //         personRequest.error = true
            //         personRequest.errorMessage="app-approval-error"
            //     })
            // })
            // .fail(handleError)
        }        
    }
    // ON CLICK END ----------------------------------------------------------------------------------
})
