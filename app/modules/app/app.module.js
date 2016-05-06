angular.module('app')
.config(['$urlRouterProvider', function($urlRouterProvider) {

    // Fixes infinite digest loop with ui-router (do NOT change unless absolutely required)
    $urlRouterProvider.otherwise(function($injector) {
      var $state = $injector.get('$state');
      $state.go('welcome');
    });

}]);
