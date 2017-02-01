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
             applicationSearch.doneReloading = applicationSearch.doneLoading = true;
        });
    };
    onLoad(false);

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------

    applicationSearch.pageChange = (newpage) => {
        applicationSearch.updateSearch('page',newpage);
    };

    applicationSearch.updateSearch = function(updateType,updateValue) {
        switch (updateType){
            case 'name':
                applicationSearch.search.page = 1;
                break;
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
            //Need to delete the other bundled apps if selected to show in review page
            if (request.bundledApps) {
                request.bundledApps.forEach(bundledApp => {
                    if (applicationSearch.packageRequests[bundledApp.id]) {
                        delete applicationSearch.packageRequests[bundledApp.id]
                    }                    
                })
            }
        })
        AppRequests.set(applicationSearch.packageRequests);
        $state.go('applications.reviewRequest');
    };

    //select parent if it is a child, deselect child if it is a parent
    applicationSearch.checkRelatedAppsBody= function(relatedApp){
        applicationSearch.toggleRequest(_.find(applicationSearch.list,{id:relatedApp.id}))   
        applicationSearch.checkRelatedAndBundledApps(_.find(applicationSearch.list,{id:relatedApp.id}))
    };

    //deselect child if it is a parent, select parent if it is a child 
    applicationSearch.checkRelatedAndBundledApps=function(application){
        //if unchecked the checkbox
        if (!applicationSearch.packageRequests[application.id]) {
            //if it is a parent then then deselect childs
            if (!application.servicePackage.parent) {
                application.relatedApps.forEach((relatedApp)=>{
                    if (applicationSearch.appCheckbox[relatedApp.id]) {
                        applicationSearch.appCheckbox[relatedApp.id]=!applicationSearch.appCheckbox[relatedApp.id]
                        applicationSearch.toggleRequest(_.find(applicationSearch.list,{id:relatedApp.id}))
                    }
                })
            }
            applicationSearch.checkBundledApps(application,false)           
        }else{
            if (application.servicePackage.parent) {
                //Need to select the other parent(if it has any) If user clicks on expandabel title
                applicationSearch.list.forEach(app=> {
                    //if it is a parent and parent of selected app
                    if (!app.servicePackage.parent&&app.servicePackage.id===application.servicePackage.parent.id&&!applicationSearch.appCheckbox[app.id]) {
                       applicationSearch.appCheckbox[app.id]=!applicationSearch.appCheckbox[app.id]
                       applicationSearch.toggleRequest(app)
                    }
                })
            }
            applicationSearch.checkBundledApps(application,true)
        }
    }

    applicationSearch.checkBundledApps= function(application,check){
        if (application.bundledApps) {
            application.bundledApps.forEach(bundledApp=>{
                applicationSearch.appCheckbox[bundledApp.id]=check
                applicationSearch.toggleRequest(_.find(applicationSearch.list,{id:bundledApp.id}))
            })
        }
    }
    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
