angular.module('common')
.factory('DataStorage',(localStorageService, API) => {
    let storage = localStorageService.get('dataStorage') || {},
        dataStorage = {};

    const initStorageIfUndefined = () => {
        if(!storage[API.getUser()]) storage[API.getUser()] = {}
    }

    const saveToLocaStorage = () => {
        localStorageService.set('dataStorage',storage)
    }

    dataStorage.setType = (type, data) => {
        initStorageIfUndefined()
        storage[API.getUser()].type = data
        saveToLocaStorage()
    }

    dataStorage.appendToType = (type, data) => {
        initStorageIfUndefined()
        if(!storage[API.getUser()][type]) storage[API.getUser()][type] = [data]
        else if(!_.isArray(storage[API.getUser()][type])){
            throw new Error('Tried appending to an existing data type that is not an array in dataStorage.')
            return
        }
        else storage[API.getUser()][type].push(data)
        saveToLocaStorage()
    }

    dataStorage.getType = (type) => {
        if(!storage[API.getUser()]) return undefined
        return storage[API.getUser()][type]
    }

    dataStorage.deleteType = (type) => {
        if(!storage[API.getUser()] || !storage[API.getUser()][type]) return
        delete storage[API.getUser()][type]
        saveToLocaStorage()
    }

    dataStorage.deleteUserStorage = () => {
        if(storage[API.getUser()]) delete storage[API.getUser()]
        saveToLocaStorage()
    }

    dataStorage.clear = () => {
        storage = {}
        saveToLocaStorage()
    }

    dataStorage.getUserStorage = () => storage[API.getUser()]

    dataStorage.getDataThatMatches = (type, comparison) => {
        if(!storage[API.getUser()] || !storage[API.getUser()][type]) return
        else if(!_.isArray(storage[API.getUser()][type])){
            throw new Error('Tried using DataStorage.getDataThatMatches on a type that isn\'t an array. Use .getType(type) instead.')
            return
        }
        else {
            const index = _.findIndex(storage[API.getUser()][type], comparison)
            if(index >= 0) return storage[API.getUser()][type][index]
            else return null
        }
    }

    DataStorage.replaceDataThatMatches = (type, comparison, newData) => {
        dataStorage.deleteDataThatMatches(type, comparison)
        dataStorage.appendToType(type, newData)
    }

    dataStorage.deleteDataThatMatches = (type, comparison) => {
        if(!storage[API.getUser()] || !storage[API.getUser()][type]) return
        else if(!_.isArray(storage[API.getUser()][type])){
            throw new Error('Tried using DataStorage.deleteDataThatMatches on a type that isn\'t an array. Use .deleteType(type) instead.')
            return
        }
        else storage[API.getUser()][type] = storage[API.getUser()][type].filter(x => !_.matches(x,comparison))
        saveToLocaStorage()
    }

    return dataStorage
})
