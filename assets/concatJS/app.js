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

	base.listOfThings={
		'CUI-NG module':{
			'url':'https://github.com/thirdwavellc/cui-ng',
			'components':{
				'cui-avatar':'https://github.com/thirdwavellc/cui-ng/tree/master/directives/cui-avatar',
				'cui-expandable':'https://github.com/thirdwavellc/cui-ng/tree/master/directives/cui-expandable',
				'cui-wizard':'https://github.com/thirdwavellc/cui-ng/tree/master/directives/cui-wizard',
				'off-click':'https://github.com/thirdwavellc/cui-ng/tree/master/directives/off-click',
				'password-validation':'https://github.com/thirdwavellc/cui-ng/tree/master/directives/password-validation'
			},
			'utilities':{
				'cui-authorization':'https://github.com/thirdwavellc/cui-ng/tree/master/utilities/cui-authorization'
			}
		},
		'CUI-Styleguide':{
			'url':'https://github.com/thirdwavellc/cui-styleguide'
		},
		'CUI-Icons':{
			'url':'https://github.com/thirdwavellc/cui-icons'
		},
		'CUI-i18n':{
			'url':'https://github.com/thirdwavellc/cui-i18n'
		},
		'CUI.JS (jquery and lodash as well)':{
			'url':'https://github.com/thirdwavellc/cui.js'
		},
		'NgMessages':{
			'url':'https://docs.angularjs.org/api/ngMessages/directive/ngMessages'
		},
		'UI Router':{
			'url':'https://github.com/angular-ui/ui-router'
		},
		'Angular local storage':{
			'url':'https://github.com/grevory/angular-local-storage'
		}
	};
	console.log('hi');
	
	base.desktopMenu=true;

	base.toggleDesktopMenu=function(){
		console.log('hi');
		base.desktopMenu=!base.desktopMenu;
	}
}]);

angular.module('app')
.config(['$stateProvider','$urlRouterProvider','$locationProvider','$injector','localStorageServiceProvider',
function($stateProvider,$urlRouterProvider,$locationProvider,$injector,localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('cui');
    $stateProvider
        .state('base',{
            url: '/',
            templateUrl: 'assets/angular-templates/home.html',
            controller: 'baseCtrl as base'
        });
    // $locationProvider.html5Mode(true);
    
    //fixes infinite digest loop with ui-router
    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      $state.go('base');
    });
}]);

})(angular);