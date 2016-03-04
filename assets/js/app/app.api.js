angular.module('app')
.factory('API',[function(){

    var myCUI= cui.api();
    // myCUI.setServiceUrl('PRD'); // PRD
    myCUI.setServiceUrl('https://apistg.np.covapp.io'); // STG

    var doAuth = function(){
        return myCUI.doSysAuth({
            clientId: 'GhpIVq1CqVX93L0lDLw0lG7QEGFhYl4c', // STG
            clientSecret: '8xFdMSR1IFSeFJjC'
            // clientId: 'wntKAjev5sE1RhZCHzXQ7ko2vCwq3wi2', // PRD
            // clientSecret: 'MqKZsqUtAVAIiWkg'
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
