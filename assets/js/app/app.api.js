angular.module('app')
.factory('API',[function(){

    var myCUI= cui.api();
    myCUI.setServiceUrl('PRD');

    var doAuth = function(){
        return myCUI.doSysAuth({
            clientId: 'wntKAjev5sE1RhZCHzXQ7ko2vCwq3wi2',
            clientSecret: 'MqKZsqUtAVAIiWkg'
        });
    };

    var token = function(){
        return myCUI.getToken();
    };

    return{
        token:token,
        cui:myCUI,
        doAuth:doAuth
    };
}]);