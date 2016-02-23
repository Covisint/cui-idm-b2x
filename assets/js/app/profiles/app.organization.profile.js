angular.module('app')
.controller('orgProfileCtrl',['$scope','$stateParams','API',
function($scope,$stateParams,API){

    var orgProfile = this;

    orgProfile.organization = {};
    
    (function() {
        API.doAuth()
        .then(function() {
            return API.cui.getOrganization({organizationId: $stateParams.id});
        })
        .then(function(res) {
            console.log(res);
            orgProfile.organization = res;
            $scope.$digest();
        })
        .fail(function(error) {
            console.log(error);
        });
    })();

}]);
