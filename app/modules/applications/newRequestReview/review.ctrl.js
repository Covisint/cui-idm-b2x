angular.module('applications')
.controller('applicationReviewCtrl',['$scope','API','AppRequests','$timeout','$state','$q',($scope,API,AppRequests,$timeout,$state,$q) => {

    const applicationReview=this;
    const appRequests=AppRequests.get(),
        appsBeingRequested=Object.keys(appRequests);

    // ON LOAD START ---------------------------------------------------------------------------------

    applicationReview.appRequests=[];

    for(var i=0; i < appsBeingRequested.length; i += 2){
        applicationReview.appRequests.push([appRequests[appsBeingRequested[i]],appRequests[appsBeingRequested[i+1]] || undefined]);
    }
    console.log('app requests',applicationReview.appRequests);

    applicationReview.numberOfRequests=0;
    appsBeingRequested.forEach(() => {
        applicationReview.numberOfRequests++;
    });

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK START ---------------------------------------------------------------------------------

    const requestsValid = () => {
        let applicationRequestArray=[];
        applicationReview.attempting=true;
        applicationReview.appRequests.forEach((appRequestGroup,i) => {
            appRequestGroup.forEach((appRequest,x) => {
                if(appRequest){
                    if(!appRequest.reason || appRequest.reason===''){
                        appRequest.reasonRequired=true;
                        applicationReview.attempting=false;
                        applicationReview.error=true;
                    }
                    else {
                        appRequest.reasonRequired=false;
                        applicationReview.error=false;
                        applicationRequestArray[i+x] = AppRequests.buildReason(appRequest,appRequest.reason);
                    }
                }
            });
        });
        if(applicationReview.error) return false;
        else return true;
    };

    applicationReview.submit = () => {
        if(!requestsValid()) return;
        const appRequests=AppRequests.getPackageRequests(API.getUser(),applicationRequestArray);

        let requestsPromises=[];

        appRequests.forEach((appRequest) => {
            requestsPromises.push(API.cui.createPackageRequest({data:appRequest}))
        });

        $q.all(requestsPromises)
        .then((res)=>{
             applicationReview.attempting=false;
                applicationReview.success=true;
                $scope.$digest();
                AppRequests.clear(); // clears app requests if the request goes through
                $timeout(() => {
                    $state.go('applications.myApplications');
                }, 3000);
        })
        .fail(() => {
            applicationReview.attempting=false;
            applicationReview.error=true;
            $scope.$digest();
        });

    };

    // ON CLICK END -----------------------------------------------------------------------------------

}]);