angular.module('organization')
.controller('orgHierarchyCtrl', function(API,APIError,DataStorage,Loader,User,$scope) {

    const orgHierarchy = this
    const pageLoader = 'orgHierarchy.loading'

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    const storedData = DataStorage.getType('orgHierarchy')

    if (storedData) {
        orgHierarchy.organizationHierarchy = storedData
    }

    if (!storedData) Loader.onFor(pageLoader)

    API.cui.getOrganizationHierarchy({organizationId: User.user.organization.id})
    .done(res => {
        // Put hierarchy response in an array as the hierarchy directive expects an array
        orgHierarchy.organizationHierarchy = [res]
        DataStorage.setType('orgHierarchy', [res])
    })
    .fail(err => {
        APIError.onFor(pageLoader, err)
    })
    .always(() => {
        Loader.offFor(pageLoader)
        $scope.$digest()
    })

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

})
