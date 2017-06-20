angular.module('organization')
.controller('newOrgGrantSearchCtrl', function ($scope, $state, $stateParams, API, DataStorage, Loader, $pagination, APIHelpers, NewGrant, $q, APIError) {
    const newOrgGrantSearch = this;
    newOrgGrantSearch.prevState={
        params:{
            orgId:$stateParams.orgId
        }
    }

    if (API.user.organization.id===$stateParams.orgId) {
        newOrgGrantSearch.prevState.name="organization.applications"
    }
    else{
        newOrgGrantSearch.prevState.name="organization.directory.orgDetails"
    }
    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    // const updateStorage = () => {
    //     DataStorage.setType('newOrgGrant', {
    //         id: $stateParams.orgId,
    //         type:'organization',
    //         applications: newOrgGrantSearch.requests.application,
    //         packages: newOrgGrantSearch.requests.package
    //     })
    //     console.log(DataStorage.getType('newOrgGrant'))
    // };

    const updateViewList = (list) => {
        let deferred= $q.defer()
        newOrgGrantSearch.viewList=[]
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
                newOrgGrantSearch.viewList.push(app)
            }
        })
        $q.all(apiPromises)
        .then(res => {
            angular.forEach(res, (app) => {
                if (newOrgGrantSearch.search.name) {
                    app[0].expanded=true
                }
                newOrgGrantSearch.viewList.push(...app)
                newOrgGrantSearch.list.push(...app)
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

    /****
        grants in DataStorage are under the type 'newGrant' and look like

        [
            {
                id:<user/org for which the grant is being made>,
                applications:<object of applications being granted>,
                packages:<object of packages being granted>
                type:<person or org>
            }
        ]
    ****/

    NewGrant.pullFromStorage(newOrgGrantSearch,$stateParams.orgId,'organization');

    Loader.onFor('newOrgGrantSearch.org');
    API.cui.getOrganization({ organizationId: $stateParams.orgId })
    .then(res => {
        newOrgGrantSearch.org = Object.assign({}, res);
        Loader.offFor('newOrgGrantSearch.org');
        $scope.$digest();
    })
    .fail(err => {
        console.error('There was an error retreiving organization details '+err)
        Loader.offFor('newOrgGrantSearch.org');
        $scope.$digest();
    })

    const searchUpdate = ({ previouslyLoaded }) => {
        Loader.onFor('newOrgGrantSearch.apps');
        if (!previouslyLoaded) {
          newOrgGrantSearch.search = Object.assign({}, $stateParams);
        }

        const type = newOrgGrantSearch.search.type || 'applications';

        const queryParams = {
            'service.name': newOrgGrantSearch.search.name,
            'service.category': newOrgGrantSearch.search.category,
            page: newOrgGrantSearch.search.page || 1,
            pageSize: newOrgGrantSearch.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0],
            sortBy: newOrgGrantSearch.search.sortBy
        };

        const queryArray = APIHelpers.getQs(queryParams);

        const queryOptions = {
            organizationId: $stateParams.orgId,
            qs: queryArray
        };

        if (type === 'applications') {
          // TODO: REPLACE WITH REAL COUNT
          $q.all([API.cui.getOrganizationGrantableCount(queryOptions), API.cui.getOrganizationGrantableApps(queryOptions)])
          .then(res => {
              newOrgGrantSearch.applicationList = res[1].slice();
              newOrgGrantSearch.count = res[0];
              if(newOrgGrantSearch.reRenderPaginate) {
                newOrgGrantSearch.reRenderPaginate();
              }
              updateViewList(res[1])
             .then(() =>{
                Loader.offFor('newOrgGrantSearch.apps');
             })
          })
          .catch(err =>{
            console.error("There was an error in retreiving grantable apps. "+err)
            APIError.onFor('newOrgGrantSearch.apps')
            Loader.offFor('newOrgGrantSearch.apps');
          })
        }
    };

    searchUpdate({
        previouslyLoaded: false
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newOrgGrantSearch.toggleRequest = ({ type, payload }) => {
        if (payload) {
            const storedRequests = newOrgGrantSearch.requests[type]
            storedRequests[payload.id] ? delete storedRequests[payload.id] : storedRequests[payload.id] = payload
            if (storedRequests[payload.id]) {
                newOrgGrantSearch[type + 'Checkbox'][payload.id] = true;
            } else if (newOrgGrantSearch[type + 'Checkbox'][payload.id]) {
                delete newOrgGrantSearch[type + 'Checkbox'][payload.id];
            }
            newOrgGrantSearch.numberOfRequests = Object.keys(newOrgGrantSearch.applicationCheckbox).length + Object.keys(newOrgGrantSearch.packageCheckbox).length

            NewGrant.updateStorage('organization',$stateParams.orgId, newOrgGrantSearch.requests.application)
        }
    }

    newOrgGrantSearch.updateSearch = () => {
        const stateParams = Object.assign({}, newOrgGrantSearch.search)
        $state.transitionTo('organization.requests.newOrgGrantSearch', stateParams, {notify:false})
        searchUpdate({
            previouslyLoaded: true
        })
    }

    newOrgGrantSearch.goToClaimSelection = () => {
        $state.go('organization.requests.newOrgGrantClaims', { orgId: $stateParams.orgId })
    }

        //select parent if it is a child, deselect child if it is a parent
    newOrgGrantSearch.checkRelatedAppsBody= function(relatedApp){
        newOrgGrantSearch.toggleRequest(_.find(newOrgGrantSearch.list,{id:relatedApp.id}))   
        newOrgGrantSearch.checkRelatedAndBundledApps(_.find(newOrgGrantSearch.list,{id:relatedApp.id}))
    };

    //deselect child if it is a parent, select parent if it is a child 
    newOrgGrantSearch.checkRelatedAndBundledApps=function(type,application){
        const storedRequests = newOrgGrantSearch.requests[type]
        //if unchecked the checkbox
        if (!storedRequests[application.id]) {
            //if it is a parent then then deselect childs
            if (!application.servicePackage.parent) {
                application.relatedApps && application.relatedApps.forEach((relatedApp)=>{
                    // if (newOrgGrantSearch[type + 'Checkbox'][relatedApp.id]) {
                        // newOrgGrantSearch[type + 'Checkbox'][relatedApp.id]=!newOrgGrantSearch[type + 'Checkbox'][relatedApp.id]
                        newOrgGrantSearch.toggleRequest({type:'application', payload:_.find(newOrgGrantSearch.applicationList,{id:relatedApp.id})})
                    // }
                })
            }
            newOrgGrantSearch.checkBundledApps(application,false)           
        }else{
            if (application.servicePackage.parent) {
                //Need to select the other parent(if it has any) If user clicks on expandabel title
                newOrgGrantSearch.applicationList.forEach(app=> {
                    //if it is a parent and parent of selected app
                    if (!app.servicePackage.parent&&app.servicePackage.id===application.servicePackage.parent.id&&!newOrgGrantSearch['applicationCheckbox'][app.id]) {
                       newOrgGrantSearch['applicationCheckbox'][app.id]=!newOrgGrantSearch['applicationCheckbox'][app.id]
                       newOrgGrantSearch.toggleRequest({type:'application', payload:app})
                    }
                })
            }
            newOrgGrantSearch.checkBundledApps(application,true)
        }
    }

    newOrgGrantSearch.checkBundledApps= function(application,check){
        if (application.bundledApps) {
            application.bundledApps.forEach(bundledApp=>{
                // newOrgGrantSearch['applicationCheckbox'][bundledApp.id]=check
                newOrgGrantSearch.toggleRequest({type:'application', payload:_.find(newOrgGrantSearch.applicationList,{id:bundledApp.id})})
            })
        }
    }
    // ON CLICK END ----------------------------------------------------------------------------------
})
