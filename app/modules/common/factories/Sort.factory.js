angular.module('common')
.factory('Sort', ['$filter',function($filter) {

    /* --------------------------------------------------

    Sort array of objects based on the specified attribute.

    Parameters: 
        - listToSort (Array):           Array of objects to sort
        - attributeToSortBy (String):   Value in each object you want to sort by
                        
            Ex 1. Pass in "person.name.given" if you want to sort by given as shown in the example:

                {   person: {
                        name: {
                            given: Peter
                        }
                    }                
                }

            Ex 2. Pass in "person.name" if you want to sort a list of translated names as shown in the example:

                {   person: {
                        name: [
                            {   
                                given: Peter,
                                lang: en
                            },
                            {
                                given: Piotr,
                                lang: pl
                            }
                        ]
                    }
                }

        - order (Boolean): Used as a "sort flag" to sort lowest to highest or vice versa

    -------------------------------------------------- */

    return {
        listSort: function(listToSort, attributeToSortBy, order) {
            listToSort.sort(function(a, b) {
                // Get the value/array of what is being sorted
                let aValueToSortBy = _.get(a, attributeToSortBy);
                let bValueToSortBy = _.get(b, attributeToSortBy);

                if (angular.isArray(aValueToSortBy)) {
                    // If an array of translated values is passed in, filter using cuiI18n
                    a = $filter('cuiI18n')(aValueToSortBy).toUpperCase();
                    b = $filter('cuiI18n')(bValueToSortBy).toUpperCase();
                }
                else {
                    if (typeof valueToSortBy === 'string') {
                        // If comparing strings, capitalize them
                        a = aValueToSortBy.toUpperCase();
                        b = bValueToSortBy.toUpperCase();
                    }
                    else {
                        // Comparing integers
                        a = aValueToSortBy, b = bValueToSortBy;
                    }
                }

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
