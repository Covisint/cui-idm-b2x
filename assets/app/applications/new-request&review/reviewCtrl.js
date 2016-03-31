angular.module('app')
.controller('applicationReviewCtrl',['$scope','API','AppRequests',function($scope,API,AppRequests){;

    var applicationReview=this;
    var appRequests=AppRequests.get(),
        appsBeingRequested=Object.keys(appRequests);

    // ON LOAD START ---------------------------------------------------------------------------------

    applicationReview.appRequests=[];

    for(var i=0; i<appsBeingRequested.length; i=i+2){
        applicationReview.appRequests.push([appRequests[appsBeingRequested[i]],appRequests[appsBeingRequested[i+1]] || undefined]);
    }

    applicationReview.numberOfRequests=0;
    appsBeingRequested.forEach(function(){
        applicationReview.numberOfRequests++;
    });

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK START ---------------------------------------------------------------------------------

    applicationReview.submit=function(){
        var applicationRequestArray=[];
        applicationReview.attempting=true;
        applicationReview.appRequests.forEach(function(appRequestGroup,i){
            appRequestGroup.forEach(function(appRequest,x){
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
        if(applicationReview.error) return;
        var appRequests=AppRequests.getPackageRequests(API.getUser(),applicationRequestArray),
            i=0;
        appRequests.forEach(function(appRequest){
            API.cui.createPackageRequest({data:appRequest})
            .then(function(res){
                i++;
                if(i===appRequests.length){
                    applicationReview.attempting=false;
                    applicationReview.success=true;
                    $scope.$digest();
                }
            })
            .fail(handleError);
        });
    };

    // ON CLICK END -----------------------------------------------------------------------------------

}]);