angular.module('app')
.controller('usersInvitationsCtrl',['localStorageService','$scope','Person','$stateParams','API','$timeout',
function(localStorageService,$scope,Person,$stateParams,API,$timeout){
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
            //get invitor's details
            usersInvitations.invitorLoading[index]=true;
            usersInvitations.inviteeLoading[index]=true;
            
            var invitorParams={
                id:invitorId
            };
            API.cui.getUsers({data:invitorParams})
            .then(function(res){
                usersInvitations.invitor[index]=res[0];
                $scope.$apply();
                $timeout(function(){
                    usersInvitations.invitorLoading[index]=false;
                },500);
            })
            .fail(function(err){
                console.log(err);
            });


            //get invitee's details
            var inviteeParams={
                id:inviteeId
            };
            API.cui.getUsers({data:inviteeParams})
            .then(function(res){
                usersInvitations.invitee[index]=res[0];
                $scope.$apply();
                $timeout(function(){
                    usersInvitations.inviteeLoading[index]=false;
                },500);
                
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