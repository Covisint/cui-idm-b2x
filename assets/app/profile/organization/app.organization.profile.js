angular.module('app')
.controller('orgProfileCtrl',['$scope','$stateParams','API',
    function($scope,$stateParams,API) {

    var orgProfile = this;

    var handleError=function(err){
        console.log('Error', err);
    };

    orgProfile.organization = {};

    API.cui.getPerson({ personId: API.getUser(), useCuid:true })
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

}]);
