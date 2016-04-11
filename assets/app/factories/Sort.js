angular.module('app')
.factory('Sort',['$filter',function($filter) {
    return {
        listSort: function(listToSort, sortType, order) {
            listToSort.sort(function(a, b) {
                if (sortType === 'alphabetically') { a = $filter('cuiI18n')(a.name).toUpperCase(), b = $filter('cuiI18n')(b.name).toUpperCase(); }
                else if (sortType=== 'date') { a = a.dateCreated, b = b.dateCreated; }
                else { a = a.status, b = b.status; }

                if ( a < b ) {
                    if (order) return 1;
                    else return -1;
                }
                else if( a > b ) {
                    if (order) return -1;
                    else return 1;
                }
                else return 0;
            });
        }
    };
}]);
