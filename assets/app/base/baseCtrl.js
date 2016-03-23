angular.module('app')
.controller('baseCtrl',['$state','Countries','Timezones','Languages','$scope','$translate','LocaleService','User','API','Menu',
function($state,Countries,Timezones,Languages,$scope,$translate,LocaleService,User,API,Menu){
    var base=this;

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

    base.menu=Menu;

    base.passwordPolicies=[
        {
            'allowUpperChars':true,
            'allowLowerChars':true,
            'allowNumChars':true,
            'allowSpecialChars':true,
            'requiredNumberOfCharClasses':3
        },
        {
            'disallowedChars':'^&*)(#$'
        },
        {
            'min':8,
            'max':18
        },
        {
            'disallowedWords':['password','admin']
        }
    ];

    // This returns the current language being used by the cui-i18n library, used for registration processes.
    base.getLanguageCode = Languages.getCurrentLanguageCode;

    base.countries=Countries;
    base.timezones=Timezones;
    base.languages=Languages.all;

    base.user = User.user;
    base.authInfo = API.authInfo;

    base.logout=API.cui.covLogout;


}]);