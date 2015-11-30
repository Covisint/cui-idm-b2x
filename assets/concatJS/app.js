(function(angular){
    'use strict';

    angular
    .module('app',['translate','ngMessages','cui.authorization','cui-ng','ui.router','snap','LocalStorageModule'])
    .run(['$rootScope', '$state', 'cui.authorization.routing', function($rootScope,$state,routing){
        // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        //     event.preventDefault();
        //     routing($rootScope, $state, toState, toParams, fromState, fromParams);
        // })
    }]);

angular.module('app')
.controller('baseCtrl',[function(){
	var base=this;
	
	base.desktopMenu=true;

	base.toggleDesktopMenu=function(){
		base.desktopMenu=!base.desktopMenu;
	}
}]);

angular.module('app')
.config(['$translateProvider','$locationProvider','$stateProvider','$urlRouterProvider','$injector','localStorageServiceProvider',
function($translateProvider,$locationProvider,$stateProvider,$urlRouterProvider,$injector,localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('cui');
    $stateProvider
        .state('base',{
            url: '/',
            templateUrl: 'assets/angular-templates/home.html',
            controller: 'baseCtrl as base'
        })
        .state('profile',{
            url: '/profile',
            templateUrl: 'assets/angular-templates/profile.html',
            controller: 'profileManagementCtrl as profile'
        });
    // $locationProvider.html5Mode(true);
    
    //fixes infinite digest loop with ui-router
    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      $state.go('base');
    });

    
    //where the locales are being loaded from
    $translateProvider.useLoader('LocaleLoader',{
        url:'bower_components/cui-i18n/dist/cui-i18n/angular-translate/',
        prefix:'locale-'
    });
     
}]);

angular.module('app')
.run(['LocaleService',function(LocaleService){
    //add more locales here
    LocaleService.setLocales('en_US','English (United States)');
    LocaleService.setLocales('pl_PL','Polish (Poland)');
    LocaleService.setLocales('zh_CN', 'Chinese (Simplified)');
    LocaleService.setLocales('pt_PT','Portuguese (Portugal)');
}]);



angular.module('app')
.controller('profileManagementCtrl',['localStorageService', '$scope', function(localStorageService, $scope){
    var profile=this;

    profile.save=function(){
        // Currently the save function just saves to local storage
        // However, once the API library is in place this will be easily
        // replacable with a function to send a PUT to the API.
        localStorageService.set('profile.user',$scope.profile.user);
    };

     var profileInStorage = localStorageService.get('profile.user');
        profile.user = profileInStorage || {};
        // This watch function saves the user form to local storage every time there's a change
        $scope.$watch('profile.user',function(){
            localStorageService.set('profile.user',$scope.profile.user);
        }, true);
}]);

})(angular);