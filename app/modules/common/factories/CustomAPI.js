angular.module('common')
.factory('CustomAPI',[()=>{

    const UP = (urlParam) => { // UP for url param
        return `{${urlParam}}`;
    };

    const QS = (queryStringArray) => { // QS for query string
        let newArray = queryStringArray.map(x => `${x}={${x}}`);
        return newArray.join('&');
    };

    const calls = [
        {cmd: 'getCategories', accepts: 'application/vnd.com.covisint.platform.category.v1+json', call: '/service/v3/categories/'},

        {cmd: 'getPersonRequestableApps', accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: `/service/v3/applications/persons/${ UP('personId') }/requestable?${ QS(['service.id','service.category','service.name','servicePackage.id','servicePackage.parentPackage.id','sortBy']) }`},

        {cmd: 'getPersonRequestableCount', accepts: 'text/plain',
            call: `/service/v3/applications/persons/${ UP('personId') }/requestable/count?${ QS(['service.id','service.category','service.name','servicePackage.id','servicePackage.parentPackage.id','sortBy']) }`},

        {cmd: 'getPersonGrantedApps', accepts: 'application/vnd.com.covisint.platform.service.application.v1+json',
            call: `/service/v3/applications/persons/${ UP('personId') }?${ QS(['service.id','service.category','service.name','servicePackage.id','servicePackage.parentPackage.id','grant.status','sortBy']) }`},

        {cmd: 'getPersonGrantedCount', accepts: 'text/plain',
            call: `/applications/persons/${ UP('personId') }/count?${ QS(['service.id','service.category','service.name','servicePackage.id','servicePackage.parentPackage.id','grant.status']) }`},


            // EDIT THIS
        {cmd: 'getOrganizationRequestable', accepts: 'text/plain',
            call: `/applications/persons/${ UP('personId') }/count?${ QS(['service.id','service.category','service.name','servicePackage.id','servicePackage.parentPackage.id','grant.status']) }`},
    ];

    const getCallWrappers = (cuiObject) => {
        return {
            getCategories:(opts) => cuiObject.doCall('getCategories',opts),
            getPersonRequestableApps:(opts)=> cuiObject.doCall('getPersonRequestableApps',opts),
            getPersonRequestableCount:(opts)=> cuiObject.doCall('getPersonRequestableCount',opts),
            getPersonGrantedApps:(opts)=> cuiObject.doCall('getPersonGrantedApps',opts),
            getPersonGrantedCount:(opts)=> cuiObject.doCall('getPersonGrantedCount',opts),
        };
    };

    return { calls, getCallWrappers };

}]);