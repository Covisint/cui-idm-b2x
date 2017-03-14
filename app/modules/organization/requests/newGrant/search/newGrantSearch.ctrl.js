angular.module('organization')
.controller('newGrantSearchCtrl', function ($scope, $state, $stateParams, API, DataStorage, Loader, $pagination, APIHelpers, NewGrant, $q) {
    const newGrantSearch = this;
    newGrantSearch.prevStateParams={
        userId:$stateParams.userId
    }

    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    const updateStorage = () => {
        DataStorage.setType('newGrant', {
            id: $stateParams.userId,
            type:'person',
            applications: newGrantSearch.requests.application,
            packages: newGrantSearch.requests.package
        })
        console.log(DataStorage.getType('newGrant'))
    };

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
    });

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
              Loader.offFor('newGrantSearch.apps');
          });
        }
    };

    searchUpdate({
        previouslyLoaded: false
    });

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newGrantSearch.toggleRequest = ({ type, payload }) => {
        const storedRequests = newGrantSearch.requests[type]
        storedRequests[payload.id] ? delete storedRequests[payload.id] : storedRequests[payload.id] = payload
        if (storedRequests[payload.id]) {
            newGrantSearch[type + 'Checkbox'][payload.id] = true;
        } else if (newGrantSearch[type + 'Checkbox'][payload.id]) {
            delete newGrantSearch[type + 'Checkbox'][payload.id];
        }
        newGrantSearch.numberOfRequests = Object.keys(newGrantSearch.applicationCheckbox).length + Object.keys(newGrantSearch.packageCheckbox).length

        updateStorage()
    }

    newGrantSearch.updateSearch = () => {
        const stateParams = Object.assign({}, newGrantSearch.search)
        $state.transitionTo('organization.requests.newGrantSearch', stateParams, {notify:false})
        searchUpdate({
            previouslyLoaded: true
        })
    }

    newGrantSearch.goToClaimSelection = () => {
        $state.go('organization.requests.newGrantClaims', { userId: $stateParams.userId })
    }

    // ON CLICK END ----------------------------------------------------------------------------------
})
