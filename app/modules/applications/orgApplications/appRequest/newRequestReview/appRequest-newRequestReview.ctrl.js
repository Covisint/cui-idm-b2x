angular.module('applications')
.controller('orgAppRequestReviewCtrl', function(API,APIError,DataStorage,Loader,User,$state) {

    const orgAppRequestReview = this;
    const pageLoader = 'orgAppRequestReview.loading';
    const attempRequest = 'orgAppRequestReview.attempting';
    const requestError = 'orgAppRequestReview.error';

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(pageLoader);
    orgAppRequestReview.appRequests = DataStorage.getType('orgAppsBeingRequested', User.user.id);
    Loader.offFor(pageLoader);

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppRequestReview.removeApplicationRequest = (requestId) => {
        delete orgAppRequestReview.appRequests[requestId];

        if (Object.keys(orgAppRequestReview.appRequests).length === 0) {
            DataStorage.deleteType('orgAppsBeingRequested');
            $state.go('applications.orgApplications.applicationList');
        } 
        else {
            DataStorage.setType('orgAppsBeingRequested', orgAppRequestReview.appRequests);
        }
    };

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

});
