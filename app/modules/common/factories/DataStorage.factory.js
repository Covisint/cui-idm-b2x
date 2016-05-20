angular.module('common')
.factory('DataStorage',[() => {
    'use strict';

    let storedObject = {},
        storedData = [];

    storedObject.set = (userId, type, data) => {
        let existingData =  _.find(storedData, {'id': userId, 'type': type}),
            objectToStore = {
                id: userId,
                type: type,
                data: data
            };

        if (existingData) {
            angular.copy(objectToStore, existingData);
        }
        else {
            storedData.push(objectToStore);    
        }
    };

    storedObject.get = (userId, type) => {
        let userObject = _.find(storedData, {'id': userId, 'type': type});
        if (userObject) {
            return userObject.data;
        }
    };

    storedObject.clear = () => {
        storedData = [];
    };

    storedObject.getUserStorage = (userId) => {
        let userStorage = [];

        storedData.forEach((object) => {
            if (object.id === userId) {
                userStorage.push(object);
            }
            return userStorage;
        });
    };

    storedObject.checkUserStorage = (userId) => {
        let userHasData = false;
        storedData.forEach((object) => {
            if (object.id === userId) {
                userHasData = true;
            }
        });
        return userHasData;
    };

    return storedObject;

}]);
