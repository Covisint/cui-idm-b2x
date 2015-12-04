angular.module('app')
.controller('usersInvitationsCtrl',['localStorageService','$scope','Person','$stateParams','API',
function(localStorageService,$scope,Person,$stateParams,API){
    var usersInvitations=this;
    usersInvitations.listLoading=true;
    usersInvitations.invitor=[];
    usersInvitations.invitee=[];
    usersInvitations.invitorLoading=[];
    usersInvitations.inviteeLoading=[];

    API.doAuth()
    .then(function(){
        Person.getInvitations()
        .then(function(res){
            usersInvitations.listLoading=false;
            usersInvitations.list=res.data;
        })
        .catch(function(err){
            usersInvitations.listLoading=false
            console.log(err);
        });
    });

    // This is needed to "attach" the invitor's and the invitee's info to the invitation
    // since the only parameter that we have from the invitation API is the ID
    usersInvitations.getInfo=function(invitorId,inviteeId,index){
        if(usersInvitations.invitor[index]===undefined){
            var params={};
            //get invitor's details
            usersInvitations.invitorLoading[index]=true;
            params={
                id:invitorId
            };
            API.cui.getUsers({data:params})
            .then(function(res){
                usersInvitations.invitorLoading[index]=false;
                usersInvitations.invitor[index]=res[0];
                $scope.$apply();
            })
            .fail(function(err){
                console.log(err);
            });


            //get invitee's details
            params={
                id:inviteeId
            };
            API.cui.getUsers({data:params})
            .then(function(res){
                usersInvitations.inviteeLoading[index]=false;
                usersInvitations.invitee[index]=res[0];
                $scope.$apply();
            })
            .fail(function(err){
                console.log(err);
            });
        }
    }


    // var search=function(){
    //     API.cui.getUser({data:usersSearch.search})
    //     .then(function(res){
    //         usersSearch.list=res;
    //         $scope.$apply();
    //     })
    //     .fail(function(err){
    //         // TBD : error handling
    //         // console.log(err);
    //     });
    // };

    // $scope.$watchCollection('usersSearch.search',search); 

}]);