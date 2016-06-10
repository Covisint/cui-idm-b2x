angular.module('common')
.factory('DataStorage',() => {
    let storage = {},
        dataStorage = {};

    const initStorageIfUndefined = (userId) => {
        if(!storage[userId]) storage[userId] = {}
    }

    dataStorage.setType = (userId, type, data) => {
        initStorageIfUndefined(userId)
        storage[userId].type = data
    }

    dataStorage.appendToType = (userId, type, data) => {
        initStorageIfUndefined(userId)
        if(!storage[userId][type]) storage[userId][type] = [data]
        else if(!_.isArray(storage[userId][type])) throw new Error('Tried appending to an existing data type that is not an array in dataStorage.')
        else storage[userId][type].push(data)
    }

    dataStorage.getType = (userId, type) => {
        if(!storage[userId]) return undefined
        return storage[userId][type]
    }

    dataStorage.deleteType = (userId, type) => {
        if(!storage[userId] || !storage[userId][type]) return
        delete storage[userId][type]
    }

    dataStorage.deleteUserStorage = (userId) => {
        if(storage[userId]) delete storage[userId]
    }

    dataStorage.clear = () => {
        storage = {}
    }

    dataStorage.getUserStorage = (userId) => storage[userId]

    dataStorage.deleteDataThatMatches = (userId, type, comparison) => {
        if(!storage[userId] || !storage[userId][type]) return
        else if(!_.isArray(storage[userId][type])) throw new Error('Tried using DataStorage.deleteDataThatMatches on a type that isn\'t an array. Use .deleteType(userId,type) instead.')
        else storage[userId][type].filter(x => !_.matches(x,comparison))
    }

    return dataStorage
})
