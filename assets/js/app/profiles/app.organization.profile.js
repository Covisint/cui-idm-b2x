angular.module('app')
.controller('orgProfileCtrl',['$scope','$stateParams','API',
function($scope,$stateParams,API) {

    var orgProfile = this;
    var userId = 'RN3BJI54'; // this will be replaced with the current user ID

    orgProfile.organization = {};

    API.doAuth()
    .then(function() {
        return API.cui.getPerson({personId: userId});
    })
    .then(function(res) {
        return API.cui.getOrganization({organizationId: res.organization.id});
    })
    .then(function(res) {
        orgProfile.organization = res;
        $scope.$digest();
    })
    .fail(function(err) {
        console.log(err);
    });

}]);
