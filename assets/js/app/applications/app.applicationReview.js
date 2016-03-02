angular.module('app')
.factory('AppRequests',['$filter',function($filter){
    var appRequestsObject={},
        appRequests={};

    appRequests.set=function(newAppRequestsObject){
        appRequestsObject=newAppRequestsObject;
    };

    appRequests.get=function(){
        return appRequestsObject;
    };

    appRequests.buildReason=function(app,reason){
        var tempApp={};
        angular.copy(app,tempApp);
        tempApp.reason=$filter('translate')('reason-im-requesting') + ' ' +  $filter('cuiI18n')(tempApp.name) + ': ' + reason;
        return tempApp;
    };


    // appRequestsObject is an object that looks something like
    // {
    //    appId:{
    //       id:appId,
    //       reason: reasonForRequestingThisApp,
    //       packageId: idOfThePackageThatContainsThisApp,
    //       ...other app properties,
    //    },
    //    otherAppId:{ ... },
    //    ...
    // }
    appRequests.getPackageRequests=function(userId,arrayOfAppsBeingRequested){
        var arrayOfPackagesBeingRequested=[],
            arrayOfPackageRequests=[];
        arrayOfAppsBeingRequested.forEach(function(app,i){
            if(arrayOfPackagesBeingRequested.indexOf(app.packageId)>-1){ // if we've parsed an app that belongs to the same pacakge
                arrayOfPackageRequests.some(function(packageRequest,i){
                    return arrayOfPackageRequests[i].servicePackage.id===app.packageId? (arrayOfPackageRequests[i].reason=arrayOfPackageRequests[i].reason + ('\n\n' + app.reason),true) : false; // if we already build a package request for this pacakge then append the reason of why we need this other app
                });
            }
            else {
                arrayOfPackageRequests[i]={
                    'requestor':{
                        id:userId,
                        type:'person'
                    },
                    servicePackage:{
                        id:arrayOfAppsBeingRequested[i].packageId,
                        type: 'servicePackage'
                    },
                    reason: app.reason
                };
                arrayOfPackagesBeingRequested[i]=app.packageId; // save the pacakge id that we're requesting in a throwaway array, so it's easier to check if we're
                                                                // already requesting this package
            }
        });
        return arrayOfPackageRequests;
    };

    return appRequests;
}])
.controller('applicationReviewCtrl',['$scope','API','AppRequests',function($scope,API,AppRequests){;

    var applicationReview=this;
    var appRequests=AppRequests.get(),
        appsBeingRequested=Object.keys(appRequests),
        userId='RN3BJI54'; // this will be replaced with the current user ID;

    var handleError=function(err){
        console.log('Error \n', err);
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    applicationReview.appRequests=[];

    appsBeingRequested.forEach(function(appId){
        applicationReview.appRequests.push(appRequests[appId]);
    });

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK START ---------------------------------------------------------------------------------

    applicationReview.submit=function(){
        var applicationRequestArray=[];
        applicationReview.attempting=true;
        applicationReview.appRequests.forEach(function(appRequest,i){
            if(!appRequest.reason || appRequest.reason===''){
                appRequest.reasonRequired=true;
                applicationReview.attempting=false;
                applicationReview.error=true;
            }
            else {
                appRequest.reasonRequired=true;
                applicationRequestArray[i] = AppRequests.buildReason(appRequest,appRequest.reason);
            }
        });
        if(applicationReview.error) return;
        var appRequests=AppRequests.getPackageRequests(userId,applicationRequestArray),
            i=0;
        appRequests.forEach(function(appRequest){
            API.cui.createPackageRequest({data:appRequest})
            .then(function(){
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