angular.module('app')
.config(['$urlRouterProvider', ($urlRouterProvider)  => {

    // Fixes infinite digest loop with ui-router (do NOT change unless absolutely required)
    $urlRouterProvider.otherwise(($injector) => {
      const $state = $injector.get('$state');
      $state.go('welcome');
    });

}]);
