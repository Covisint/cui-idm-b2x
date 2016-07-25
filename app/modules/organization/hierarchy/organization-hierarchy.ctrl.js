angular.module('organization')
.controller('orgHierarchyCtrl', function(API,APIError,Loader,User,$scope) {

    const orgHierarchy = this;
    const initializing = 'orgHierarchy.loading'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(initializing)

    API.cui.getOrganizationHierarchy({organizationId: User.user.organization.id})
    .done(res => {
        // Put hierarchy response in an array as the hierarchy directive expects an array
        orgHierarchy.organizationHierarchy = [res];
    })
    .fail(err => {
        APIError.onFor(initializing, err)
    })
    .always(() => {
        Loader.offFor(initializing)
        $scope.$digest()
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

});
