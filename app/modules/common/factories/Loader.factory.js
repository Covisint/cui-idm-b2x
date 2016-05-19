angular.module('common')
.factory('Loader',[()=>{
    let loadingDetails = {
    };

    return {
        onFor:(newFor, message = undefined) => {
            loadingDetails[newFor] = {
                status: true,
                message
            };
        },
        offFor:(newFor) => {
            loadingDetails[newFor] = undefined;
        },
        toggleFor:(newFor,message = undefined) => {
            if(loadingDetails[newFor]) loadingDetails[newFor] = undefined;
            else {
                loadingDetails[newFor] = {
                    status:true,
                    message
                };
            }
        },
        for: loadingDetails
    };
}]);