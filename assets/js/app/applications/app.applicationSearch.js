angular.module('app')
.controller('applicationSearchCtrl',['API','$scope','$stateParams','$state',
function(API,$scope,$stateParams,$state){
    var applicationSearch = this;
    var userId='RN3BJI54'; // this will be replaced with the current user ID

    var nameSearch=$stateParams.name;  // get the packageId from the url

    var handleError=function(err){
        console.log('Error \n', err);
    };

    // ON LOAD START ---------------------------------------------------------------------------------

    var user;

    API.doAuth()
    .then(function(res){
        return API.cui.getPerson({personId:userId});
    })
    .then(function(res){
        user=res;
        return API.cui.getOrganization
    })
   .fail(function(err){
        console.log(err);
   })

    // ON LOAD END ------------------------------------------------------------------------------------

    // ON CLICK FUNCTIONS START -----------------------------------------------------------------------



    // ON CLICK FUNCTIONS END -------------------------------------------------------------------------

}]);
