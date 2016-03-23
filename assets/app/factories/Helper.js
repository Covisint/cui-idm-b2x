angular.module('app')
.factory('Helper',[function(){

    return {
        getDateFromUnixStamp:function(unixTimeStamp){
            var dateGranted = new Date(unixTimeStamp);
            var dateGrantedFormatted = (dateGranted.getMonth()+1) + '.' + dateGranted.getDate() + '.' + dateGranted.getFullYear();
            return dateGrantedFormatted;
        }

    };

}]);