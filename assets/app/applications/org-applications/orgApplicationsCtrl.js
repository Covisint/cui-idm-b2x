angular.module('app')
.controller('orgApplicationsCtrl', ['$scope','API','Sort',
function($scope,API,Sort) {
    'use strict';

    var orgApplications = this;

    orgApplications.loading = true;

    // HELPER FUNCTIONS START ---------------------------------------------------------------------------------
    // HELPER FUNCTIONS END -----------------------------------------------------------------------------------

    // ON LOAD START ------------------------------------------------------------------------------------------

    console.log('Organization Applications');
    orgApplications.loading = false;

    // ON LOAD END --------------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -------------------------------------------------------------------------------
    // ON CLICK FUNCTIONS END ---------------------------------------------------------------------------------

}]);
