angular.module('common')
.factory('Helpers', function ($injector) {
    /*
        takes a string and if the string contains '.factory' replaces that string with an instance of the factory
        with the name = name.replace('.factory', '')
    */
    this.replaceWithFactory = (name) => {
        if (name.indexOf('.factory') > -1) {
            return $injector.get(name.replace('.factory', ''),
                   `Cui.js initializer error : error replacing with factory. Factory ${ name } not found.`)
        } else return name
    }

    return this
})
