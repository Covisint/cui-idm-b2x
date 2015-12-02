angular.module('app')
.controller('baseCtrl',['Person',function(Person){
    var base=this;
    
    base.desktopMenu=true;

    base.toggleDesktopMenu=function(){
        base.desktopMenu=!base.desktopMenu;
    };

    // Person.getAll() gets all the people in the API
    // Person.getById(id) gets 1 person


}]);