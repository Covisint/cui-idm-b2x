angular.module('app')
.controller('baseCtrl',['Person',function(Person){
	var base=this;
	
	base.desktopMenu=true;

    var myCUI= cui.api();
    myCUI.setService('https://api.covapp.io');

    myCUI.doSysAuth({
        clientId: 'HlNH57h2X9GlUGWTyvztAsXZGFOAHQnF',
        clientSecret: 'LhedhdbgKYWcmZru'
    });

    Person.get(myCUI.getToken(),myCUI.getService())
    .then(function(res){
        console.log(res);
    })

	base.toggleDesktopMenu=function(){
		base.desktopMenu=!base.desktopMenu;
	};
}]);