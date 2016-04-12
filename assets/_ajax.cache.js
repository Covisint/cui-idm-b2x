/**
 * Created by juan on 4/12/2016.
 */
(function($, win){

    var ajax = $.ajax;
    var win = $(win);

    console.log( "testing" );

    $.ajax = function(){

        var $d = $.

        ajax.apply($,arguments).then(function(){

        },function(){

        });
    }


})($, window);
