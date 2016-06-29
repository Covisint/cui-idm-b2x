angular.module('organization')
.controller('orgProfileCtrl', function(API,Loader,User,$scope,$state) {

    const orgProfile = this;
    const loaderName = 'orgProfile.';

    orgProfile.organization = User.user.organization;

    /* -------------------------------------------- ON LOAD START --------------------------------------------- */

    Loader.onFor(loaderName + 'loading');

    API.cui.getPersonsAdmins({qs: [['organization.id', orgProfile.organization.id], ['securityadmin', true]]})
    .then(function(res) {
        orgProfile.securityAdmins = res;
        Loader.offFor(loaderName + 'loading');
        $scope.$digest();
    })
    .fail((error) => {
        console.error('Error', error);
        if (!orgProfile.organization) {
            $state.go('misc.loadError');
        }
        Loader.offFor(loaderName + 'loading');
        $scope.$digest();
    });

    /* --------------------------------------------- ON LOAD END ---------------------------------------------- */

});
