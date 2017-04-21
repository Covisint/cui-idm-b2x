angular.module('applications')
.controller('applicationReviewCtrl',['$scope','API','AppRequests','$timeout','$state','$q','localStorageService',function($scope,API,AppRequests,$timeout,$state,$q,localStorage) {

    let applicationReview=this;

    if(Object.keys(AppRequests.get()).length===0 && localStorage.get('appsBeingRequested')) {
        AppRequests.set(localStorage.get('appsBeingRequested'));
    }

    let appRequests=angular.copy(AppRequests.get());
    angular.forEach(appRequests , (request) =>{
        if (request.bundledApps) {
            request.bundledApps.forEach(bundledApp => {
                if (appRequests[bundledApp.id]) {
                    delete appRequests[bundledApp.id]
                }                    
            })
        }
    })
    const appsBeingRequested=Object.keys(appRequests)

    if (appsBeingRequested.length===0) {
        $state.go('applications.search');
    }

    // ON LOAD START ---------------------------------------------------------------------------------

    applicationReview.appRequests=[];

    for(let i=0; i < appsBeingRequested.length; i += 2){
        const applicationGroup = [];
        applicationGroup.push(appRequests[appsBeingRequested[i]]);
        if (appRequests[appsBeingRequested[i+1]]) {
            applicationGroup.push(appRequests[appsBeingRequested[i+1]]);
        }
        //get Terms And Conditions for requested packages
        applicationGroup.forEach(app=>{
            if (app.servicePackage.personTacEnabled) {
                API.cui.getOrgTacOfPackage({packageId:app.servicePackage.id})
                .then(res=>{
                    app.tac=res;
                })
                .fail(err=>{
                    console.log("There was an error fetching Tac")
                    console.log(err)
                })
            }
        })
        applicationReview.appRequests.push(applicationGroup);
    }

    applicationReview.numberOfRequests=0;
    appsBeingRequested.forEach(() => {
        applicationReview.numberOfRequests += 1;
    });

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK START ---------------------------------------------------------------------------------
    let applicationRequestArray;

    const requestsValid = () => {
        applicationRequestArray=[];
        applicationReview.attempting=true;
        let error = false;
        applicationReview.appRequests.forEach((appRequestGroup,i) => {

            appRequestGroup.forEach((appRequest,x) => {
                if (appRequest.servicePackage.reasonRequired) {
                    if(!appRequest.reason || appRequest.reason===''){
                        appRequest.reasonRequired=true;
                        applicationReview.attempting=false;
                        error=true;
                    }
                    else {
                        appRequest.reasonRequired=false;
                        applicationRequestArray[i+x] = AppRequests.buildReason(appRequest,appRequest.reason);
                    }
                } else {
                    applicationRequestArray[i+x] = appRequest;
                }
            });
        });
        applicationReview.error = error;
        if (error) {
            return false;
        } else {
            return true;
        }
    };

    applicationReview.submit = () => {
        if (!requestsValid()) {
            return;
        }
        const appRequests=AppRequests.getPackageRequests(API.getUser(),applicationRequestArray);

        let requestsPromises=[];

        appRequests.forEach((appRequest) => {
            requestsPromises.push(API.cui.createPackageRequest({data:appRequest}))
        });

        $q.all(requestsPromises)
        .then((res)=>{
            applicationReview.attempting = false;
            applicationReview.success = true;
            AppRequests.clear(); // clears app requests if the request goes through
            localStorage.set('appsBeingRequested',{});
            $timeout(() => {
                $state.go('applications.myApplications');
            }, 3000);
        })
        .catch(() => {
            applicationReview.attempting = false;
            applicationReview.error = true;
        });
    };

    applicationReview.updateSearch = (nameSearch) => {
        applicationReview.search = nameSearch;
    };

    applicationReview.showTac= (application)=>{
        if (application.tac) {
            applicationReview.tacContent=application.tac.tacText
            applicationReview.step=2
        }
    }
    // ON CLICK END -----------------------------------------------------------------------------------

}]);