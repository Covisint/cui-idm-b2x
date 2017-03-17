angular.module('organization')
.controller('newOrgGrantSearchCtrl', function ($scope, $state, $stateParams, API, DataStorage, Loader, $pagination, APIHelpers, NewGrant, $q, APIError) {
    const newOrgGrantSearch = this;
    newOrgGrantSearch.prevStateParams={
        orgId:$stateParams.orgId
    }

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const updateStorage = () => {
        DataStorage.setType('newOrgGrant', {
            id: $stateParams.orgId,
            type:'organization',
            applications: newOrgGrantSearch.requests.application,
            packages: newOrgGrantSearch.requests.package
        })
        console.log(DataStorage.getType('newOrgGrant'))
    };

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
    });

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
              Loader.offFor('newOrgGrantSearch.apps');
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
        const storedRequests = newOrgGrantSearch.requests[type]
        storedRequests[payload.id] ? delete storedRequests[payload.id] : storedRequests[payload.id] = payload
        if (storedRequests[payload.id]) {
            newOrgGrantSearch[type + 'Checkbox'][payload.id] = true;
        } else if (newOrgGrantSearch[type + 'Checkbox'][payload.id]) {
            delete newOrgGrantSearch[type + 'Checkbox'][payload.id];
        }
        newOrgGrantSearch.numberOfRequests = Object.keys(newOrgGrantSearch.applicationCheckbox).length + Object.keys(newOrgGrantSearch.packageCheckbox).length

        updateStorage()
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

    // ON CLICK END ----------------------------------------------------------------------------------
})
