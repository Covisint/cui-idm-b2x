angular.module('organization')
.controller('userDetailsCtrl', ['$scope','$stateParams','API','Timezones','UserProfile',
function($scope,$stateParams,API,Timezones,UserProfile) {
    'use strict';

    const userDetails = this;
    let userID = $stateParams.id;

    userDetails.loading = true;
    userDetails.profileRolesSwitch = true;


    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function handleError(err) {
        userDetails.loading = false;
        $scope.$digest();
        console.log(err);
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------
    // var userParams = angular.isDefined( userID )? { personId: userID }:{personId: API.getUser(), useCuid:true};

    API.cui.getPerson({userId:userID})
    .then(function(res) {
        console.log(res);
    });

    UserProfile.getProfile({personId: userID})
    .then(function(res) {
        angular.merge(userDetails, res);

        // In order to reuse a view which specifies its databinding to userProfile.
        // $scope.userProfile = {};
        // $scope.userProfile.saving = true;
        // $scope.userProfile.fail = false;
        // $scope.userProfile.success = false;
        // $scope.userProfile.timezoneById = Timezones.timezoneById;
        // $scope.userProfile.toggleOffFunctions = {};
        // UserProfile.injectUI( $scope.userProfile, $scope );
        // angular.copy( res, $scope.userProfile );

        userDetails.loading = false;
    }, function(err) {
        userDetails.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
