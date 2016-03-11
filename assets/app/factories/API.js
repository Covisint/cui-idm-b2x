angular.module('app')
.factory('API',['$state','User','$rootScope',function($state,User,$rootScope){

    var myCUI = cui.api();
    cui.log('cui.js v', myCUI.version()); // CUI Log

    // myCUI.setServiceUrl('PRD'); // PRD
    myCUI.setServiceUrl('STG'); // STG

    var originUri = 'coke-idm.run.covapp.io'; // Coke
    // var originUri = 'coke-idm.run.covapp.io'; // Covisint

    // // CUIJS caches instance id for unsecure calls
    // myCUI.covAuthInfo({
    //     // In PROD we need to verify that if we dont pass in originUri cui.js will
    //     // pass the host for us dynamically!
    //     originUri : originUri
    // });
    // console.log('CURRENT STATE',$state.current);

    // if ($state.current.url === '/empty' ) {
        // cui.log('Empty State : ', $state.current);
        // myCUI.handleCovAuthResponse()
        // .then(function(res){
        //     console.log('TEST!!!');
        //     User.set(res);
        //     return myCUI.getPersonRoles({personId:User.get()});
        // })
        // .then(function(roles){
        //     console.log('ROLES',roles);
        //     var roleList=[];
        //     roles.forEach(function(role){
        //         roleList.push(role.name);
        //     });
        //     User.setEntitlements(roleList);
        // });
    // }
    // else{
        // cui.log('Im OUT of empty', $state.current);
        function jwtAuthHandler() {
            return myCUI.covAuth({
                originUri: originUri,
                authRedirect: window.location.href.split('#')[0] + '#/empty'
                // appRedirect: window.location.href
            });
        };

        myCUI.setAuthHandler(jwtAuthHandler);

        // myCUI.handleCovAuthResponse()
        // .then(function(res){
        //     console.log('TEST!!!');
        //     User.set(res);
        //     return myCUI.getPersonRoles({personId:User.get()});
        // })
        // .then(function(roles){
        //     console.log('ROLES',roles);
        //     var roleList=[];
        //     roles.forEach(function(role){
        //         roleList.push(role.name);
        //     });
        //     User.setEntitlements(roleList);
        // });
    // }

    return {
        cui: myCUI,
        getUser: User.get,
        setUser: User.set,
        getUserEntitlements: User.getEntitlements,
        setUserEntitlements: User.setEntitlements,
        handleCovAuthResponse: myCUI.handleCovAuthResponse
    };

}]);