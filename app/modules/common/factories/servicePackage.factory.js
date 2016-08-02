angular.module('common')
.factory('ServicePackage', () => {
    var servicePackage = {}

    servicePackage.set = (userId, newServicePackageArray) => {
        servicePackage.userId = newServicePackageArray;
    };

    servicePackage.get = (userId) => {
        return servicePackage.userId;
    };

    servicePackage.clear = () => {
        servicePackage = {};
    };

    servicePackage.checkStorage = (userId) => {
        if (servicePackage.userId) {
            return true;
        }
        return false;
    };

    return servicePackage;

})
