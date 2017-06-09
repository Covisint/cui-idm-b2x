angular.module('applications')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state','AppRequests','localStorageService','$q','$pagination', function (API,$scope,$stateParams,$state,AppRequests,localStorage,$q,$pagination) {
    let applicationSearch = this;

    if(Object.keys(AppRequests.get()).length===0 && localStorage.get('appsBeingRequested')) { // If there's nothing in app memory and there's something in local storage
        AppRequests.set(localStorage.get('appsBeingRequested'));
    }
    applicationSearch.packageRequests = AppRequests.get();
    applicationSearch.appCheckbox = {};

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const processNumberOfRequestedApps = (pkgRequest) => {
        if (pkgRequest) {
            applicationSearch.numberOfRequests += 1;
        } else {
            applicationSearch.numberOfRequests -= 1;
        }
    };

    const updateViewList = (list) => {
        let deferred= $q.defer()
        applicationSearch.viewList=[]
        let qs=[]
        let apiPromises = []
        angular.forEach(list, (app,parentIndex) => {
            // Child App and Parent app requested by user
            if(app.servicePackage.parent&&app.relatedApps){
                let flag=false
                angular.forEach(app.relatedApps, (realtedApp,index) => {
                    if (_.find(list,{id:realtedApp.id})) {
                        flag=true
                    }
                    else{
                        qs.push(['service.id',realtedApp.id])
                    }
                    if (index===app.relatedApps.length-1&&qs.length!==0) {
                        apiPromises.push(API.cui.getPersonRequestableApps({personId:API.getUser(),qs:qs}))
                        qs=[]
                    }
                })
            }
            else{
                applicationSearch.viewList.push(app)
            }
        })
        $q.all(apiPromises)
        .then(res => {
            angular.forEach(res, (app) => {
                if (applicationSearch.search.name) {
                    app[0].expanded=true
                }
                applicationSearch.viewList.push(...app)
                applicationSearch.list.push(...app)
            })
            deferred.resolve()
        })
        .catch(err =>{
            console.log("There was an error loading parent requestable apps")
                deferred.reject(err)
        })
        return deferred.promise
    }

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    const onLoad = (previouslyLoaded) => {
        if(previouslyLoaded) {
            applicationSearch.doneReloading = false;
        }
        else { // pre populate fields based on state params on first load
            let numberOfRequests = 0;
            Object.keys(applicationSearch.packageRequests).forEach(function(appId) { // Gets the list of package requests saved in memory
                // This sets the checkboxes back to marked when the user clicks back after being in request review
                applicationSearch.appCheckbox[appId] = true;
                numberOfRequests += 1;
            });
            applicationSearch.numberOfRequests = numberOfRequests;

            applicationSearch.search = {};
            applicationSearch.search.name = $stateParams.name;
            applicationSearch.search.category = $stateParams.category;
            applicationSearch.search.page = parseInt($stateParams.page, 10);
            applicationSearch.search.pageSize = parseInt($stateParams.pageSize, 10);
        }

        let query = [];
        if (applicationSearch.search.name) {
            query.push(['service.name',applicationSearch.search.name]);
        }
        if (applicationSearch.search.category) {
            query.push(['service.category',applicationSearch.search.category]);
        }

        applicationSearch.search.pageSize = applicationSearch.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0];
        query.push(['pageSize',String(applicationSearch.search.pageSize)]);

        applicationSearch.search.page = applicationSearch.search.page || 1;
        query.push(['page',String(applicationSearch.search.page)]);

        let opts = {
            personId: API.getUser(),
            useCuid:true,
            qs: query
        };

        const promises = [API.cui.getPersonRequestableApps(opts),API.cui.getPersonRequestableCount(opts)];

        $q.all(promises)
        .then((res) => {
             applicationSearch.list = res[0];
             applicationSearch.count = res[1];
             updateViewList(res[0])
             .then(() =>{
                applicationSearch.doneReloading = applicationSearch.doneLoading = true;
             })
        });
    };
    onLoad(false);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.pageChange = (newpage) => {
        applicationSearch.updateSearch('page',newpage);
    };

    applicationSearch.updateSearch = function(updateType,updateValue) {
        if (updateType!=='page'){
            applicationSearch.search.page = 1;
        }

        // doesn't change state, only updates the url
        $state.transitionTo('applications.search', applicationSearch.search, {notify:false});
        onLoad(true);
    };

    applicationSearch.toggleRequest = function(application) {
        if (!applicationSearch.packageRequests[application.id]) {
            applicationSearch.packageRequests[application.id] = application;
        } else {
            delete applicationSearch.packageRequests[application.id];
        }
        localStorage.set('appsBeingRequested',applicationSearch.packageRequests);
        processNumberOfRequestedApps(applicationSearch.packageRequests[application.id]);
    };

    applicationSearch.saveRequestsAndCheckout = function() {
        let qs = []
        //needed to set a flag for related apps to display in review page
        angular.forEach(applicationSearch.packageRequests,(request)=>{
            if (request.relatedApps) {
                request.relatedAppSelectedCount=0
                request.relatedApps.forEach(relatedApp=>{
                    if(_.find(applicationSearch.packageRequests,{id:relatedApp.id})){
                        relatedApp.selected=true
                        request.relatedAppSelectedCount++
                    }
                    else{
                        relatedApp.selected=false
                    }
                })
            }
            // If Selected Related app full details not available need to fetch it
            if (!request.servicePackage) {
                qs.push(['service.id',request.id])
            }
        })
        if (qs.length!==0) {
            API.cui.getPersonRequestableApps({personId:API.getUser(),qs:qs})
            .then(res => {
                res.forEach(app =>{
                    applicationSearch.packageRequests[app.id] = app
                })
                AppRequests.set(applicationSearch.packageRequests);
                $state.go('applications.reviewRequest');
            })
        }
        else{
            AppRequests.set(applicationSearch.packageRequests);
            $state.go('applications.reviewRequest');
        }
    };

    //Related apps will always appear inside body, So need to select parent if it is selected 
    applicationSearch.checkRelatedAppsBody= function(relatedApp, parent){
        if (_.find(applicationSearch.list,{id:relatedApp.id})) {
            applicationSearch.toggleRequest(_.find(applicationSearch.list,{id:relatedApp.id}))
        }
        else{
            applicationSearch.list.push(relatedApp)
            applicationSearch.toggleRequest(relatedApp)
        }           
        applicationSearch.checkRelatedAndBundledApps(_.find(applicationSearch.list,{id:relatedApp.id}),parent)
    };

    //Deselect Child apps If it has any and select parent if checked from parent body 
    applicationSearch.checkRelatedAndBundledApps=function(application,parent){
        //if unchecked the checkbox
        if (!applicationSearch.packageRequests[application.id]) {
            //if it is a parent then then deselect childs
            if (!parent) {
                application.relatedApps&&application.relatedApps.forEach((relatedApp)=>{
                    if (applicationSearch.appCheckbox[relatedApp.id]) {
                        applicationSearch.appCheckbox[relatedApp.id]=!applicationSearch.appCheckbox[relatedApp.id]
                        applicationSearch.toggleRequest(_.find(applicationSearch.list,{id:relatedApp.id}))
                    }
                })
                applicationSearch.checkBundledApps(application,false)
            }      
        }else{
            if (parent) {
                if (!applicationSearch.appCheckbox[parent.id]) {
                    applicationSearch.appCheckbox[parent.id]=true
                    applicationSearch.toggleRequest(parent)
                    applicationSearch.checkBundledApps(parent,true)
                }
            }else
            applicationSearch.checkBundledApps(application,true)
        }
    }

    applicationSearch.checkBundledApps= function(application,check){
        if (application.bundledApps) {
            application.bundledApps.forEach(bundledApp=>{
                applicationSearch.appCheckbox[bundledApp.id]=check
                if (_.find(applicationSearch.list,{id:bundledApp.id}))
                    applicationSearch.toggleRequest(_.find(applicationSearch.list,{id:bundledApp.id}))
            })
        }
    }
    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
