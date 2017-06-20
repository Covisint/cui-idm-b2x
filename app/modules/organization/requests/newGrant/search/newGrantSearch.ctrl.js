angular.module('organization')
.controller('newGrantSearchCtrl', function ($scope, $state, $stateParams, API, DataStorage, Loader, $pagination, APIHelpers, NewGrant, $q) {
    const newGrantSearch = this;
    newGrantSearch.prevState={
        params:{
            userId:$stateParams.userId,
            orgId:$stateParams.orgId
        },
        name:"organization.directory.userDetails"
    }
    
    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    /****
        grants in DataStorage are under the type 'newGrant' and look like

        [
            {
                userId:<user for which the grant is being made>,
                applications:<object of applications being granted>,
                packages:<object of packages being granted>
            }
        ]
    ****/

    NewGrant.pullFromStorage(newGrantSearch,$stateParams.userId,'person');

    Loader.onFor('newGrantSearch.user');
    API.cui.getPerson({ personId: $stateParams.userId })
    .then(res => {
        newGrantSearch.user = Object.assign({}, res);
        Loader.offFor('newGrantSearch.user');
        $scope.$digest();
    })
    .fail(err =>{
        console.error("There was an error in fetching user details" + err)
        Loader.offFor('newGrantSearch.user');
        $scope.$digest();
    })

    const searchUpdate = ({ previouslyLoaded }) => {
        Loader.onFor('newGrantSearch.apps');
        if (!previouslyLoaded) {
          newGrantSearch.search = Object.assign({}, $stateParams);
        }

        const type = newGrantSearch.search.type || 'applications';

        const queryParams = {
            'service.name': newGrantSearch.search.name,
            'service.category': newGrantSearch.search.category,
            page: newGrantSearch.search.page || 1,
            pageSize: newGrantSearch.search.pageSize || $pagination.getUserValue() || $pagination.getPaginationOptions()[0],
            sortBy: newGrantSearch.search.sortBy
        };

        const queryArray = APIHelpers.getQs(queryParams);

        const queryOptions = {
            personId: $stateParams.userId,
            qs: queryArray
        };

        if (type === 'applications') {
          // TODO: REPLACE WITH REAL COUNT
          $q.all([API.cui.getPersonGrantableCount(queryOptions), API.cui.getPersonGrantableApps(queryOptions)])
          .then(res => {
              newGrantSearch.applicationList = res[1].slice();
              newGrantSearch.count = res[0];
              if(newGrantSearch.reRenderPaginate) {
                newGrantSearch.reRenderPaginate();
              }
              Loader.offFor('newGrantSearch.apps')
          })
          .catch(err => {
            console.error('There was an error fetching grantable apps or/and its count' + err)
            Loader.offFor('newGrantSearch.apps')
            newGrantSearch.grantableAppsError=true
          })
        }
    };

    searchUpdate({
        previouslyLoaded: false
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newGrantSearch.toggleRequest = ({ type, payload }) => {
        if (payload) {
            const storedRequests = newGrantSearch.requests[type]
            storedRequests[payload.id] ? delete storedRequests[payload.id] : storedRequests[payload.id] = payload
            if (storedRequests[payload.id]) {
                newGrantSearch[type + 'Checkbox'][payload.id] = true;
            } else if (newGrantSearch[type + 'Checkbox'][payload.id]) {
                delete newGrantSearch[type + 'Checkbox'][payload.id];
            }
            newGrantSearch.numberOfRequests = Object.keys(newGrantSearch.applicationCheckbox).length + Object.keys(newGrantSearch.packageCheckbox).length
            NewGrant.updateStorage('person',$stateParams.userId, newGrantSearch.requests.application)
        }
    }

    newGrantSearch.updateSearch = () => {
        const stateParams = Object.assign({}, newGrantSearch.search)
        $state.transitionTo('organization.requests.newGrantSearch', stateParams, {notify:false})
        searchUpdate({
            previouslyLoaded: true
        })
    }

    newGrantSearch.goToClaimSelection = () => {
        $state.go('organization.requests.newGrantClaims', { userId: $stateParams.userId, orgId: $stateParams.orgId })
    }

    //select parent if it is a child, deselect child if it is a parent
    newGrantSearch.checkRelatedAppsBody= function(relatedApp){
        newGrantSearch.toggleRequest(_.find(newGrantSearch.list,{id:relatedApp.id}))   
        newGrantSearch.checkRelatedAndBundledApps(_.find(newGrantSearch.list,{id:relatedApp.id}))
    };

    //deselect child if it is a parent, select parent if it is a child 
    newGrantSearch.checkRelatedAndBundledApps=function(type,application){
        const storedRequests = newGrantSearch.requests[type]
        //if unchecked the checkbox
        if (!storedRequests[application.id]) {
            //if it is a parent then then deselect childs
            if (!application.servicePackage.parent) {
                application.relatedApps && application.relatedApps.forEach((relatedApp)=>{
                    // if (newGrantSearch[type + 'Checkbox'][relatedApp.id]) {
                        // newGrantSearch[type + 'Checkbox'][relatedApp.id]=!newGrantSearch[type + 'Checkbox'][relatedApp.id]
                        newGrantSearch.toggleRequest({type:'application', payload:_.find(newGrantSearch.applicationList,{id:relatedApp.id})})
                    // }
                })
            }
            newGrantSearch.checkBundledApps(application,false)           
        }else{
            if (application.servicePackage.parent) {
                //Need to select the other parent(if it has any) If user clicks on expandabel title
                newGrantSearch.applicationList.forEach(app=> {
                    //if it is a parent and parent of selected app
                    if (!app.servicePackage.parent&&app.servicePackage.id===application.servicePackage.parent.id&&!newGrantSearch['applicationCheckbox'][app.id]) {
                       newGrantSearch['applicationCheckbox'][app.id]=!newGrantSearch['applicationCheckbox'][app.id]
                       newGrantSearch.toggleRequest({type:'application', payload:app})
                    }
                })
            }
            newGrantSearch.checkBundledApps(application,true)
        }
    }

    newGrantSearch.checkBundledApps= function(application,check){
        if (application.bundledApps) {
            application.bundledApps.forEach(bundledApp=>{
                // newGrantSearch['applicationCheckbox'][bundledApp.id]=check
                newGrantSearch.toggleRequest({type:'application', payload:_.find(newGrantSearch.applicationList,{id:bundledApp.id})})
            })
        }
    }
    // ON CLICK END ----------------------------------------------------------------------------------
})
