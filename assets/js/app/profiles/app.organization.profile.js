angular.module('app')
.controller('orgProfileCtrl',['$scope','$stateParams','API',
function($scope,$stateParams,API) {

    var orgProfile = this;
    orgProfile.organization = {};
    
    API.doAuth()
    .then(function() {
        // Get Organization based on url id parameter
        return API.cui.getOrganization({organizationId: $stateParams.id});
    })
    .then(function(res) {
        orgProfile.organization = res;
        $scope.$digest();
    })
    .fail(function(error) {
        console.log(error);
    });

}]);
