angular.module('organization')
.controller('orgAppRequestReviewCtrl', function(API,APIError,BuildPackageRequests,DataStorage,Loader,User,$q,$state,$timeout,AppRequests,$stateParams) {

    const orgAppRequestReview = this
    const loaderName = 'orgAppRequestReview.'
    orgAppRequestReview.stateParamsOrgId=$stateParams.orgId;

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'loading')
    /*orgAppRequestReview.appsRequests = DataStorage.getType('orgAppsBeingRequested', User.user.id)*/
    Loader.offFor(loaderName + 'loading')

     if(Object.keys(AppRequests.get()).length===0 && DataStorage.getType('orgAppsBeingRequested', User.user.id)) {
        AppRequests.set(DataStorage.getType('orgAppsBeingRequested', User.user.id));
    }


    const appRequests=AppRequests.get(),
        appsBeingRequested=Object.keys(appRequests);

    if (appsBeingRequested.length===0) {
        $state.go('organization.search',{orgId:orgAppRequestReview.stateParamsOrgId});
    }

    orgAppRequestReview.appRequests=[];

    for(let i=0; i < appsBeingRequested.length; i += 2){
        const applicationGroup = [];
        applicationGroup.push(appRequests[appsBeingRequested[i]]);
        if (appRequests[appsBeingRequested[i+1]]) {
            applicationGroup.push(appRequests[appsBeingRequested[i+1]]);
        }
        //get Terms And Conditions for requested packages
        applicationGroup.forEach(app=>{
            if (app.servicePackage.organizationTacEnabled) {
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
        orgAppRequestReview.appRequests.push(applicationGroup);
    }

    orgAppRequestReview.numberOfRequests=0;
    appsBeingRequested.forEach(() => {
        orgAppRequestReview.numberOfRequests += 1;
    });

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

    /* --------------------------------------- ON CLICK FUNCTIONS START --------------------------------------- */

    orgAppRequestReview.removeApplicationRequest = (requestId) => {
        delete orgAppRequestReview.appRequests[requestId]

        if (Object.keys(orgAppRequestReview.appRequests).length === 0) {
            DataStorage.deleteType('orgAppsBeingRequested')
            $state.go('organization.applications',{orgId:orgAppRequestReview.stateParamsOrgId})
        } 
        else {
            DataStorage.setType('orgAppsBeingRequested', orgAppRequestReview.appRequests)
        }
    }

    orgAppRequestReview.submit = () => {
        let requestArray = []

        Loader.onFor(loaderName + 'attempting')
        
        /*Object.keys(orgAppRequestReview.appRequests).forEach((request) => {
            requestArray.push(orgAppRequestReview.appRequests[request])
        })
*/
         orgAppRequestReview.appRequests.forEach((appRequestGroup,i) => {
            appRequestGroup.forEach((appRequest,x) => {
                 requestArray[i+x] = appRequest;
            })
            
        })

        $q.all(BuildPackageRequests(User.user.organization.id, 'organization', requestArray))
        .then(() => {
            Loader.offFor(loaderName + 'attempting')
            DataStorage.deleteType('orgAppsBeingRequested')
            AppRequests.clear(); // clears app requests if the request goes through
            DataStorage.setType('orgAppsBeingRequested',{});
            orgAppRequestReview.success=true
            $timeout(() => {
                 $state.go('organization.applications',{orgId:User.user.organization.id});
            }, 3000); 
        })
        .catch(error => {
            APIError.onFor(loaderName + 'requestError')
            Loader.offFor(loaderName + 'attempting')
        })
    }

    orgAppRequestReview.updateSearch = (nameSearch) => {
        orgAppRequestReview.search = nameSearch;
    };

    orgAppRequestReview.showTac= (application)=>{
        if (application.tac) {
            orgAppRequestReview.tacContent=application.tac.tacText
            orgAppRequestReview.step=2
        }
    }

    /* ---------------------------------------- ON CLICK FUNCTIONS END ---------------------------------------- */

})
