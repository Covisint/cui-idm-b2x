angular.module('common')
.service('SharedService', function () {
    /*****
        this service serves as an instantiable class
        that can be extended to provide information throughout the app
        using the base controller

        How to use:
        angular.module('myModule')
        .factory/service/provider('MyProvider', function(SharedService){
            const MyProvider = Object.create(SharedService)
        })

        MyProvider now has an object that serves as a data holder for switchable loaders, error messages etc.

        methods
        .onFor(property:String, <message>:String)
            enables that property in the details object, setting the message associated with that property
            if you use onFor for multiple properties without using "offFor" to disable them
            there's a count that gets incremented, and that property will only be disabled once offFor
            is called on that property n times, where n is the amount of times it was enabled

        .offFor(property:String)

        .toggleFor(property:String, <message>:String)

        .for
            this holds a reference to the storage object, so that you can associate it with your base ctrl
    *****/

    this.details = {}

    this.onFor = function (property, message) {
        if (this.details[property]) {
            this.details[property].count
                ? this.details[property].count += 1
                : this.details[property].count = 2 // count is only defined if there's more than 1
            if (message) {
                this.details[property].message = message;
            }
        } else {
            this.details[property] = {
                status: true,
                message
            }
        }
    }

    this.offFor = function (property) {
        if (!this.details[property]) {
            return;
        } else if (!this.details[property].count || this.details[property].count===1) {
            delete this.details[property];
        } else {
            this.details[property].count -= 1;
        }
    }

    this.toggleFor = function (property,message) {
        if (this.details[property]) {
            delete this.details[property];
        } else {
            this.details[property] = {
                status:true,
                message
            }
        }
    }

    this.clearAll = function() {
        for (const key in this.details) delete this.details[key]
    }

    this.for = this.details

    return this
})