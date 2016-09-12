angular.module('common')
.factory('Languages',['$cuiI18n','LocaleService',function($cuiI18n,LocaleService){

    var languages=$cuiI18n.getLocaleCodesAndNames();

    return {
        all:languages,
        getCurrentLanguageCode : function(){
            if (LocaleService.getLocaleCode().indexOf('_')>-1) {
                return LocaleService.getLocaleCode().split('_')[0];
            } else {
                return LocaleService.getLocaleCode();
            }
        }
    };
}]);