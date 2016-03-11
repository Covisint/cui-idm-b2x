angular.module('app')
.controller('baseCtrl',['$state','GetCountries','GetTimezones','$scope','$translate','LocaleService','User','API',
function($state,GetCountries,GetTimezones,$scope,$translate,LocaleService,User,API){
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
    base.getLanguageCode = function(){
        if(LocaleService.getLocaleCode().indexOf('_')>-1) return LocaleService.getLocaleCode().split('_')[0];
        else return LocaleService.getLocaleCode();
    };

    var setCountries=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        GetCountries(language)
        .then(function(res){
            base.countries=res.data;
        })
        .catch(function(err){
            console.log(err);
        });
    };

    var setTimezones=function(language){
        language = language || 'en';
        if(language.indexOf('_')>-1){
            language=language.split('_')[0];
        }
        GetTimezones(language)
        .then(function(res){
            base.timezones=res.data;
        })
        .catch(function(err){
            console.log(err);
        });
    };

    $scope.$on('languageChange',function(e,args){
        // console.log(e);
        setCountries(args);
        setTimezones(args);
    });

    API.handleCovAuthResponse()
    .then(function(res){
        console.log('TEST!!!');
        API.setUser(res);
        return API.cui.getPersonRoles({personId:API.getUser()});
    })
    .then(function(roles){
        console.log('ROLES',roles);
        var roleList=[];
        roles.forEach(function(role){
            roleList.push(role.name);
        });
        API.setUserEntitlements(roleList);
    });

    base.userEntitlements=[];
    $scope.$on('newEntitlements',function(newEntitlements){
        base.userEntitlements = newEntitlements;
    });

    setCountries($translate.proposedLanguage());
    setTimezones($translate.proposedLanguage());


}]);