angular.module('app')
.factory('API',[function(){
    
    var myCUI= cui.api();
    myCUI.setService('https://api.covapp.io');
    
    var doAuth = function(){
        return myCUI.doSysAuth({
            clientId: 'wntKAjev5sE1RhZCHzXQ7ko2vCwq3wi2',
            clientSecret: 'MqKZsqUtAVAIiWkg'
        });
    }

    var token = function(){
        return myCUI.getToken();
    };

    var url = function(){
        return myCUI.getService();
    };

    return{
        token:token,
        url:url,
        cui:myCUI,
        doAuth:doAuth
    };
}]);