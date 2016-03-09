angular.module('app')
.factory('API',function($state){

    var myCUI = cui.api();
    cui.log('cui.js v', myCUI.version());

    // myCUI.setServiceUrl('PRD'); // PRD
    myCUI.setServiceUrl('STG'); // STG

    var originUri = 'coke-idm.run.covapp.io'; // Coke
    // var originUri = 'coke-idm.run.covapp.io'; // Covisint

    // If not empty controller then fire cui stuff
    if ($state.current.url !== '/empty' ) {
        cui.log('Not Empty State : ', $state.current, window.location);


        // CUIJS caches instance id for unsecure calls
        myCUI.covAuthInfo({
            // In PROD we need to verify that if we dont pass in originUri cui.js will
            // pass the host for us dynamically!
            originUri : originUri,
        });

        function jwtAuthHandler() {
            return myCUI.covAuth({
                originUri: originUri,
                authRedirect: window.location.href.split('#//')[0] + '/#/empty'
                // authRedirect: 'http://localhost:9001/#/empty'
            })
            .fail(function (err) {
            });
        };

        myCUI.setAuthHandler(jwtAuthHandler);

    }
    else {
        cui.log('Empty State : ', $state.current);
        myCUI.handleCovAuthResponse();
    }

    return {
        cui: myCUI
    };

});
