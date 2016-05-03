angular.module('organization')
.controller('userDetailsCtrl', ['$scope','$stateParams','API','Timezones','UserService',
function($scope,$stateParams,API,Timezones,UserService) {
    'use strict';
    var userDetails = this;
    var userID = $stateParams.id;

    userDetails.loading = true;
    userDetails.profileRolesSwitch = true;


    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function handleError(err) {
        userDetails.loading = false;
        $scope.$digest();
    };

    var onLoadFinish = function onLoadFinish() {
        return;
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------
    var userParams = angular.isDefined( userID )? { personId: userID }:{personId: API.getUser(), useCuid:true};

    UserService.getProfile( {personId: API.getUser(), useCuid:true}).then(function(res){
        angular.copy( res, userDetails );

        //In order to reuse a view which specifies its databinding to userProfile.
        $scope.userProfile = {};
        $scope.userProfile.saving = true;
        $scope.userProfile.fail = false;
        $scope.userProfile.success = false;
        $scope.userProfile.timezoneById = Timezones.timezoneById;
        $scope.userProfile.toggleOffFunctions = {};
        UserService.injectUI( $scope.userProfile, $scope );
        angular.copy( res, $scope.userProfile );

        userDetails.loading = false;
    },function(err){
        userDetails.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
