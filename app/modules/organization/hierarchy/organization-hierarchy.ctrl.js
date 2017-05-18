angular.module('organization')
.controller('orgHierarchyCtrl', function(API,APIError,DataStorage,Loader,User,$scope,$state,$stateParams) {

    const orgHierarchy = this
    const pageLoader = 'orgHierarchy.loading'
    orgHierarchy.stateParamsOrgId=$stateParams.orgId

    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    const addExpandedProperty = (childOrgs) => {

        childOrgs.forEach(org => {
            if (org.children) {
                org.expanded=false
                addExpandedProperty(org.children)
            }
        })
    }

    /* -------------------------------------------- HELPER FUNCTIONS END --------------------------------------------- */    

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    const storedData = DataStorage.getType('orgHierarchy')

    if (storedData) {
        orgHierarchy.organizationHierarchy = storedData
    }

    if (!storedData) Loader.onFor(pageLoader)

    API.cui.getOrganizationHierarchy({organizationId:orgHierarchy.stateParamsOrgId })
    .done(res => {
        // Put hierarchy response in an array as the hierarchy directive expects an array
        orgHierarchy.organizationHierarchy = [res]
        // add expended property to all the org with children directive needs it to work for 
        // expandable and collapsable function
        if (orgHierarchy.organizationHierarchy[0].children) {
            addExpandedProperty(orgHierarchy.organizationHierarchy[0].children)
        }
        DataStorage.setType('orgHierarchy', orgHierarchy.organizationHierarchy)
    })
    .fail(err => {
        APIError.onFor(pageLoader, err)
    })
    .always(() => {
        Loader.offFor(pageLoader)
        $scope.$digest()
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */
    /* */
    orgHierarchy.goToOrgPrfile = (org) => {
        $state.go('organization.profile',{orgId:org.id})
    }

    orgHierarchy.toggleExpand = (object) => {
        object.expanded=!object.expanded
        $scope.$digest()
    }
    /* */
})
