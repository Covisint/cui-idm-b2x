angular.module('app')
.controller('baseCtrl',['$state','getCountries','$scope','$translate',
function($state,getCountries,$scope,$translate){
    var base=this;

    base.desktopMenu=true;

    base.toggleDesktopMenu=function(){
        base.desktopMenu=!base.desktopMenu;
    };

    base.goBack=function(){
        if($state.previous.name.name!==''){
            $state.go($state.previous.name,$state.previous.params);
        }
        else {
            $state.go('base');
        }
    };

    base.generateHiddenPassword=function(password){
        return Array(password.length+1).join('•');
    };

    var setCountries=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        getCountries(language)
        .then(function(res){
            base.countries=res.data;
        })
        .catch(function(err){
            console.log(err);
        });
    };

    $scope.$on('languageChange',function(e,args){
        // console.log(e);
        setCountries(args);
    });

    setCountries($translate.proposedLanguage());


}]);