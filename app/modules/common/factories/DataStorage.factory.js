angular.module('common')
.factory('DataStorage',(localStorageService) => {
    let storage = localStorageService.get('dataStorage') || {},
        dataStorage = {};

    const initStorageIfUndefined = (userId) => {
        if(!storage[userId]) storage[userId] = {}
    }

    const saveToLocaStorage = () => {
        localStorageService.set('dataStorage',storage)
    }

    dataStorage.setType = (userId, type, data) => {
        initStorageIfUndefined(userId)
        storage[userId].type = data
        saveToLocaStorage()
    }

    dataStorage.appendToType = (userId, type, data) => {
        initStorageIfUndefined(userId)
        if(!storage[userId][type]) storage[userId][type] = [data]
        else if(!_.isArray(storage[userId][type])){
            throw new Error('Tried appending to an existing data type that is not an array in dataStorage.')
            return
        }
        else storage[userId][type].push(data)
        saveToLocaStorage()
    }

    dataStorage.getType = (userId, type) => {
        if(!storage[userId]) return undefined
        return storage[userId][type]
    }

    dataStorage.deleteType = (userId, type) => {
        if(!storage[userId] || !storage[userId][type]) return
        delete storage[userId][type]
        saveToLocaStorage()
    }

    dataStorage.deleteUserStorage = (userId) => {
        if(storage[userId]) delete storage[userId]
        saveToLocaStorage()
    }

    dataStorage.clear = () => {
        storage = {}
        saveToLocaStorage()
    }

    dataStorage.getUserStorage = (userId) => storage[userId]

    dataStorage.getDataThatMatches = (userId, type, comparison) => {
        if(!storage[userId] || !storage[userId][type]) return
        else if(!_.isArray(storage[userId][type])){
            throw new Error('Tried using DataStorage.getDataThatMatches on a type that isn\'t an array. Use .getType(userId,type) instead.')
            return
        }
        else {
            const index = _.findIndex(storage[userId][type], comparison)
            if(index >= 0) return storage[userId][type][index]
            else return null
        }
    }

    dataStorage.deleteDataThatMatches = (userId, type, comparison) => {
        if(!storage[userId] || !storage[userId][type]) return
        else if(!_.isArray(storage[userId][type])){
            throw new Error('Tried using DataStorage.deleteDataThatMatches on a type that isn\'t an array. Use .deleteType(userId,type) instead.')
            return
        }
        else storage[userId][type].filter(x => !_.matches(x,comparison))
        saveToLocaStorage()
    }

    return dataStorage
})
