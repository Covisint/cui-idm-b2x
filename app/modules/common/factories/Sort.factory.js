angular.module('common')
.factory('Sort',['$filter',function($filter) {
    return {
        listSort: function(listToSort, sortType, order) {
            listToSort.sort(function(a, b) {
                if (sortType === 'alphabetically') { 
                    if (a.name[0]) {
                        a = $filter('cuiI18n')(a.name).toUpperCase(),
                        b = $filter('cuiI18n')(b.name).toUpperCase();    
                    }
                    else {
                        a = a.name.given.toUpperCase(),
                        b = b.name.given.toUpperCase();
                    }
                }
                else if (sortType=== 'date') { 
                    if (a.dateCreated) {
                        a = a.dateCreated, b = b.dateCreated;
                    }
                    else {
                        a = a.creation, b = b.creation;
                    }
                }
                else { 
                    a = a.status, b = b.status; 
                }

                if ( a < b ) {
                    if (order) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
                else if (a > b) {
                    if (order) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            });
        }
    };
}]);
