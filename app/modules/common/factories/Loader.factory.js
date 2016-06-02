angular.module('common')
.factory('Loader',[() => {

    let loadingDetails = {};

    return {
        onFor: (newFor, message = undefined) => {
            if (loadingDetails[newFor]) {
                loadingDetails[newFor].count ? loadingDetails[newFor].count++ : loadingDetails[newFor].count = 2;
                if (message) {
                    loadingDetails[newFor].message = message;
                }
            }
            else {
                loadingDetails[newFor] = {
                    status: true,
                    message
                };
            }
        },

        offFor: (newFor) => {
            if (!loadingDetails[newFor].count || loadingDetails[newFor].count === 1) {
                loadingDetails[newFor] = null;
                delete loadingDetails[newFor];
            }
            else {
                loadingDetails[newFor].count --;
            }
        },

        toggleFor: (newFor, message = undefined) => {
            if (loadingDetails[newFor]) {
                loadingDetails[newFor] = null;
                delete loadingDetails[newFor];
            }
            else {
                loadingDetails[newFor] = {
                    status: true,
                    message
                };
            }
        },

        for: loadingDetails

    };
}]);
