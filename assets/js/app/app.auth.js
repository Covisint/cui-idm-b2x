angular.module('app')
.factory('Auth',[function(){
    
    var myCUI= cui.api();
    myCUI.setService('https://api.covapp.io');

    var doAuth = function(){
        myCUI.doSysAuth({
            clientId: 'HlNH57h2X9GlUGWTyvztAsXZGFOAHQnF',
            clientSecret: 'LhedhdbgKYWcmZru'
        });
    };

    var token = function(){
        doAuth();
        return myCUI.getToken();
    };

    var url = function(){
        return myCUI.getService();
    };

    return{
        token:token,
        url:url
    };
}]);