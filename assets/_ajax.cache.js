/**
 * Mock ajax calls for stored calls and results in localstorage.
 * Otherwise make the ajax calls saving the result for the next call.
 * Prevent from caching calls found at nonCachable.
 */
(function($){
    'use strict'

    var ajax = $.ajax;
    var nonCachable = ["POST", "PUT", "DELETE"];

    $.ajax = function(params){

        return (function( params){

            var strParams = JSON.stringify( params );
            var cachedResult = localStorage.getItem(strParams);
            var $d = $.Deferred();

            //prevent caching ./appConfig.json
            var isCachable = nonCachable.indexOf( params.type ) === -1 && params.url !== './appConfig.json';

            if( cachedResult && isCachable ){

                setTimeout(function(){
                    $d.resolve( JSON.parse( cachedResult ) );
                }, 100 );
            }
            else{

                ajax.apply(null,arguments).then(function(res){

                    if( isCachable )
                        localStorage.setItem( strParams, JSON.stringify( res ) );

                    $d.resolve( res );
                },function(err){
                    $d.reject(err);
                });
            }

            return $d.promise();
        })( params);
    }
})($);