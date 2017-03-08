angular.module('applications')
.controller('orgAppRequestReviewCtrl', function(API,APIError,BuildPackageRequests,DataStorage,Loader,User,$q,$state) {

    const orgAppRequestReview = this
    const loaderName = 'orgAppRequestReview.'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'loading')
    orgAppRequestReview.appRequests = DataStorage.getType('orgAppsBeingRequested', User.user.id)
    Loader.offFor(loaderName + 'loading')

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppRequestReview.removeApplicationRequest = (requestId) => {
        delete orgAppRequestReview.appRequests[requestId]

        if (Object.keys(orgAppRequestReview.appRequests).length === 0) {
            DataStorage.deleteType('orgAppsBeingRequested')
            $state.go('applications.orgApplications.applicationList')
        } 
        else {
            DataStorage.setType('orgAppsBeingRequested', orgAppRequestReview.appRequests)
        }
    }

    orgAppRequestReview.submit = () => {
        let requestArray = []

        Loader.onFor(loaderName + 'attempting')

        Object.keys(orgAppRequestReview.appRequests).forEach((request) => {
            requestArray.push(orgAppRequestReview.appRequests[request])
        })

        $q.all(BuildPackageRequests(User.user.organization.id, 'organization', requestArray))
        .then(() => {
            Loader.offFor(loaderName + 'attempting')
            $state.go('applications.orgApplications.applicationList')
        })
        .catch(error => {
            APIError.onFor(loaderName + 'requestError')
            Loader.offFor(loaderName + 'attempting')
        })
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

})
