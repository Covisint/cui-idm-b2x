angular.module('common')
.factory('DataStorage', (API, localStorageService) => {

    let storage = localStorageService.get('dataStorage') || {}
    let dataStorage = {}

    const initStorageIfUndefined = () => {
        if (!storage[API.getUser()]) {
            storage[API.getUser()] = {}
        }
    }

    const saveToLocaStorage = () => {
        localStorageService.set('dataStorage', storage)
    }

    /****************************************
        FOR OBJECT AND ARRAY TYPE DATA
    ****************************************/

    // completely overrides a type
    dataStorage.setType = (type, data) => {
        initStorageIfUndefined()
        storage[API.getUser()][type] = data
        saveToLocaStorage()
    }

    dataStorage.getType = (type) => {
        if (!storage[API.getUser()]) {
            return undefined
        }
        return storage[API.getUser()][type]
    }

    dataStorage.deleteType = (type) => {
        if (!storage[API.getUser()] || !storage[API.getUser()][type]) {
            return
        }
        delete storage[API.getUser()][type]
        saveToLocaStorage()
    }

    // deletes the storage for just the currently logged in user
    dataStorage.deleteUserStorage = () => {
        if (storage[API.getUser()]) {
            delete storage[API.getUser()]
        }
        saveToLocaStorage()
    }

    // deletes the storage for every user in local storage
    dataStorage.clear = () => {
        storage = {}
        saveToLocaStorage()
    }

    dataStorage.getUserStorage = () => storage[API.getUser()]

    /****************************************
        FOR ARRAY TYPE DATA ONLY
    ****************************************/

    // appends to a certain type
    // NOTE: Make sure to use data that you can later distinguish between using dataThatMatches
    // I recommend using replaceDataThatMatches instead unless you know what you're doing
    dataStorage.appendToType = (type, data) => {
        initStorageIfUndefined()
        if (!storage[API.getUser()][type]) {
            storage[API.getUser()][type] = [data]
        } 
        else if (!_.isArray(storage[API.getUser()][type])) {
            throw new Error('Tried appending to an existing data type that is not an array in dataStorage.')
            return
        } 
        else {
            storage[API.getUser()][type].push(data)
        }
        saveToLocaStorage()
    }

    // returns ALL data that matches against a given comparison or undefined if no results
    dataStorage.getDataThatMatches = (type, comparison) => {
        if (!storage[API.getUser()] || !storage[API.getUser()][type]) {
            return undefined
        } 
        else if (!_.isArray(storage[API.getUser()][type])) {
            throw new Error('Tried using DataStorage.getDataThatMatches on a type that isn\'t an array. Use .getType(type) instead.')
            return
        } 
        else {
            const matches = storage[API.getUser()][type].filter(x => {
                return _.isMatch(x, comparison)
            })
            if (matches.length > 0) {
                return matches
            } 
            else {
                return undefined
            }
        }
    }

    // replaces all data that matches against a certain comparison and appends
    // new data to that type's array
    dataStorage.replaceDataThatMatches = (type, comparison, newData) => {
        dataStorage.deleteDataThatMatches(type, newData)
        dataStorage.appendToType(type, newData)
    }

    dataStorage.deleteDataThatMatches = (type, comparison) => {
        if (!storage[API.getUser()] || !storage[API.getUser()][type]) {
            return
        } 
        else if (!_.isArray(storage[API.getUser()][type])) {
            throw new Error('Tried using DataStorage.deleteDataThatMatches on a type that isn\'t an array. Use .deleteType(type) instead.')
            return
        } 
        else {
            storage[API.getUser()][type] = storage[API.getUser()][type].filter(x => {
                return !_.isMatch(x, comparison)
            })
        }
        saveToLocaStorage()
    }

    return dataStorage
})
