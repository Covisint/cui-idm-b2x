angular.module('app')
.controller('userDetailsCtrl', ['$scope','$stateParams','API','UserService',
function($scope,$stateParams,API,UserService) {
    'use strict';
    var userDetails = this;
    var userID = $stateParams.id;

    // userDetails.loading = true;
    userDetails.profileRolesSwitch = true;


    // HELPER FUNCTIONS START ------------------------------------------------------------------------

    var handleError = function handleError(err) {
        userDetails.loading = false;
        $scope.$digest();
        console.log('Error', err);
    };

    var onLoadFinish = function onLoadFinish() {
        return;
    };

    // HELPER FUNCTIONS END --------------------------------------------------------------------------

    // ON LOAD START ---------------------------------------------------------------------------------
    var userParams = angular.isDefined( userID )? { personId: userID }:{personId: API.getUser(), useCuid:true};

    UserService.getProfile( {personId: API.getUser(), useCuid:true}).then(function(res){
        angular.copy( res, userDetails );
        console.log( "userDetails", userDetails );
        userDetails.loading = false;
    },function(err){
        userDetails.loading = false;
    });

    // ON LOAD END -----------------------------------------------------------------------------------

}]);
