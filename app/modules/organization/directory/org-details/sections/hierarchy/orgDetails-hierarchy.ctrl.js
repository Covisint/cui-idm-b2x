angular.module('organization')
.controller('orgDetailsHierarchyCtrl',function(API,APIError,Loader,User,$scope,$state,$stateParams) {
	'use strict';
    const orgDetailsHierarchy = this
    const pageLoader = 'orgDetailsHierarchy.loading'
    orgDetailsHierarchy.stateParamsOrgId=$stateParams.orgId

    /* -------------------------------------------- HELPER FUNCTIONS START --------------------------------------------- */

    const addExpandedProperty = (childOrgs,parentOrg) => {

        childOrgs.forEach(org => {
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
    Loader.onFor(pageLoader)
    API.cui.getOrganizationHierarchy({organizationId:orgDetailsHierarchy.stateParamsOrgId })
    .done(res => {
        // Put hierarchy response in an array as the hierarchy directive expects an array
        orgDetailsHierarchy.organizationHierarchy = [res]
        // add expended property to all the org with children directive needs it to work for 
        // expandable and collapsable function
        if (orgDetailsHierarchy.organizationHierarchy[0].children) {
            addExpandedProperty(orgDetailsHierarchy.organizationHierarchy[0].children,orgDetailsHierarchy.organizationHierarchy[0])
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
    orgDetailsHierarchy.goToOrgPrfile = (org) => {
        $state.go('organization.directory.orgDetails',{orgId:org.id})
    }

    orgDetailsHierarchy.toggleExpand = (object) => {
        object.expanded=!object.expanded
        // let updateOrgChildren= (orgs) => {
        //     orgs.forEach(org => {
        //         if (org.id===object.id) {
        //             org.expanded=object.expanded
        //             return;
        //         }
        //         if (org.children) {
        //             updateOrgChildren(org.children)
        //         }
        //     })
            
        //     if (true) {};
        // }
        // updateOrgChildren(orgDetailsHierarchy.organizationHierarchy[0].children)
        $scope.$digest()
    }
});
