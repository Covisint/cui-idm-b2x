angular.module('organization')
.controller('newOrgGrantCtrl', function(API, $stateParams, $scope, $state, $filter, Loader, DataStorage,NewGrant) {

    const newOrgGrant = this
    newOrgGrant.prevState={
        params:{
            orgId:$stateParams.orgId
        }
    }
    if (API.user.organization.id===$stateParams.orgId) {
        newOrgGrant.prevState.name="organization.applications"
    }
    else{
        newOrgGrant.prevState.name="organization.directory.orgDetails"
    }
    
    // HELPER FUNCTIONS START ------------------------------------------------------------------------
    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------

    newOrgGrant.searchType = 'applications'

    /****
        grants in DataStorage are under the type 'newGrant' and look like

        [
            {
                id:<user/org for which the grant is being made>,
                applications:<array of applications being granted>,
                packages:<array of packages being granted>
                type:person or organiztion
            }
        ]
    ****/
    NewGrant.pullFromStorage(newOrgGrant,$stateParams.orgId,'organization');
    Loader.onFor('newOrgGrant.org')
    API.cui.getOrganization({ organizationId:$stateParams.orgId })
    .then(res => {
        newOrgGrant.org = Object.assign({}, res)
        Loader.offFor('newOrgGrant.org')
        $scope.$digest()
    })

    Loader.onFor('newOrgGrant.categories')
    API.cui.getCategories()
    .then(res => {
        newOrgGrant.categories = res.slice()
        Loader.offFor('newOrgGrant.categories')
        $scope.$digest()
    })
    .fail(err => {
        Loader.offFor('newOrgGrant.categories')
        newOrgGrant.categoryError=true
        $scope.$digest()
    })

    // ON LOAD END -----------------------------------------------------------------------------------

    // ON CLICK START --------------------------------------------------------------------------------

    newOrgGrant.searchCallback = (opts) => {
        if (!opts) {
            $state.go('organization.requests.newOrgGrantSearch',{type:newOrgGrant.searchType, orgId: $stateParams.orgId});
        } else if (typeof opts ==='string') {
            $state.go('organization.requests.newOrgGrantSearch',{type:newOrgGrant.searchType, orgId: $stateParams.orgId, name: opts});
        } else {
            const optsParser = {
                category: (unparsedCategory) => {
                    const category = $filter('cuiI18n')(unparsedCategory)
                    $state.go('organization.requests.newOrgGrantSearch',{type:newOrgGrant.searchType, orgId: $stateParams.orgId, category})
                }
            }
            optsParser[opts.type](opts.value)
        }
    }

    newOrgGrant.goToClaimSelection = () => {
        $state.go('organization.requests.newOrgGrantClaims', { orgId: $stateParams.orgId })
    }
    // ON CLICK END ----------------------------------------------------------------------------------

});
