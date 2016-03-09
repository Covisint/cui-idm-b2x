angular.module('app')
.controller('orgProfileCtrl',
function($scope,$stateParams,API) {

    var orgProfile = this;
    var userId = 'UJ9AGVP9'; // this will be replaced with the current user ID

    orgProfile.organization = {};


    /*API.doAuth()
    .then(function() {
        return API.cui.getPerson({personId: userId});
    })
    .then(function(res) {
        return API.cui.getOrganization({organizationId: res.organization.id});
    })
    .then(function(res) {
        orgProfile.organization = res;
        orgProfile.loadingDone = true;
        $scope.$digest();
    })
    .fail(function(err) {
        console.log(err);
    });*/

    API.cui.getPerson({personId: userId})
    .then(function(res) {
        return API.cui.getOrganization({organizationId: res.organization.id});
    })
    .then(function(res) {
        orgProfile.organization = res;
        orgProfile.loadingDone = true;
        $scope.$digest();
    })
    .fail(function(err) {
        console.log(err);
    });

});
