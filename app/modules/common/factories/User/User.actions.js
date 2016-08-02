angular.module('common')
.factory('UserActions', (API, $q, PubSub) => function (User) {
    const cui = API.cui()[appConfig.cuiObjects[0].name]
    const organizations = API.organizations()

    this.popuplateUserInfo = ({ cuid }) => {
        const deferred = $q.defer()
        const promises = [myCUI.getPersonRoles({ personId: cuid }), myCUI.getPerson({ personId: cuid })]
        API.helpers().getApiCall(promises)
        .then(([ roles, person ]) => {
            this.setEntitlements(roles.map(role => role.name))
            this.setUser(person)
            return organizations.getOrganizationForPerson(person)
        })
        .then(org => {
            this.appendedToUser({ organization: org })
            deferred.resolve({ roles: User.details.entitlements })
        })
        return deferred.promise
    }

    /*
        Allows to set a user object that is available anywhere in the app
        In controllers / factories as User.details (must inject User factory)
        and in templates as base.User.details
    */
    this.setUser = (user) => {
        const entitlements = user.entitlements || []
        User.details = Object.assign({}, user, {
            entitlements
        })
        this.broadcastUserChange(User.details)
    }

    /*
        Pass in an object with properties to attach to the user in User.details
    */
    this.appendedToUser = (object) => {
        User.details = Object.assign({}, User.details, object)
        this.broadcastUserChange(User.details)
    }

    /*
        Pass an array of entitlements that gets appended on to the user object
        in User.details.entitlements

        This array of entitlements is then used to determine if a user has access
        to a certain route, using our cui.authorization module

        https://github.com/thirdwavellc/cui-ng/tree/master/utilities/cui-authorization
    */
    this.setEntitlements = (entitlements) => {
        User.details = Object.assign({}, User.details, {
            entitlements
        })
        this.broadcastUserChange(User.details)
    }

    this.broadcastUserChange = (user) => {
        PubSub.publish('userChange', user)
    }


    return this
})