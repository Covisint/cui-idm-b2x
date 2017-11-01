angular.module('organization')
.controller('orgHierarchyCtrl', function(API,APIError,DataStorage,Loader,User,$scope,$state,$stateParams) {

    const orgHierarchy = this
    const pageLoader = 'orgHierarchy.loading'
    orgHierarchy.stateParamsOrgId=$stateParams.orgId
    orgHierarchy.expanded=false

    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    const addExpandedProperty = (childOrgs, parentOrg) => {
        childOrgs.forEach((org ,index) => {
            // Need to remove org if it is pending
            if (org.status==="PENDING") {
                parentOrg.children.splice(index,1)
                return
            }
            if (org.children) {
                org.expanded=false
                addExpandedProperty(org.children,org)
            }
        })
    }

    /* -------------------------------------------- HELPER FUNCTIONS END --------------------------------------------- */    

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */
    
    const storedData = DataStorage.getType('orgHierarchy')

    if (storedData) {
        orgHierarchy.organizationHierarchy = storedData
        // add expended property to all the org with children directive needs it to work for 
        // expandable and collapsable function
        if (orgHierarchy.organizationHierarchy[0].children) {
            addExpandedProperty(orgHierarchy.organizationHierarchy[0].children, orgHierarchy.organizationHierarchy[0])
        }
    }

    if (!storedData) Loader.onFor(pageLoader)
    // Loader.onFor(pageLoader)
    API.cui.getOrganizationHierarchy({organizationId:orgHierarchy.stateParamsOrgId })
    .done(res => {
        // Put hierarchy response in an array as the hierarchy directive expects an array
        orgHierarchy.organizationHierarchy = [res]
        DataStorage.setType('orgHierarchy', orgHierarchy.organizationHierarchy)
        // add expended property to all the org with children directive needs it to work for 
        // expandable and collapsable function
        if (orgHierarchy.organizationHierarchy[0].children) {
            addExpandedProperty(orgHierarchy.organizationHierarchy[0].children, orgHierarchy.organizationHierarchy[0])
        }
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
        $state.go('organization.directory.orgDetails',{orgId:org.id})
    }

    orgHierarchy.toggleExpand = (object) => {
        object.expanded=!object.expanded
        let updateOrgChildren= (orgs) => {
            orgs.forEach(org => {
                if (org.id===object.id) {
                    org.expanded=object.expanded
                    return;
                }
                if (org.children) {
                    updateOrgChildren(org.children)
                }
            })
            
            if (true) {};
        }
        updateOrgChildren(orgHierarchy.organizationHierarchy[0].children)
        $scope.$digest()
    }

    orgHierarchy.toggleAll = (toggleFlag) => {
        orgHierarchy.expanded=!orgHierarchy.expanded
        let updateFlag= (orgs) => {
            orgs.forEach(org => {
                if (org.children) {
                    org.expanded=!toggleFlag
                    updateFlag(org.children)
                }
            })
        }
        updateFlag(orgHierarchy.organizationHierarchy[0].children)
    }
    /* */
})
