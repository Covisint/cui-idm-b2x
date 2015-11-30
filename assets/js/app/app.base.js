angular.module('app')
.controller('baseCtrl',[function(){
	var base=this;
	
	base.desktopMenu=true;

	base.toggleDesktopMenu=function(){
		base.desktopMenu=!base.desktopMenu;
	}
}]);