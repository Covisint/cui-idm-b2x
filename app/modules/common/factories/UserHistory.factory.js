angular.module('common')
.factory('UserHistory', function(API, APIError, LocaleService, $q, $timeout) {

    const errorName = 'userHistoryFactory.'

    const UserHistory = {
        getTodaysDate:function(){
            let today=new Date()
            let dd=today.getDate()
            let yyyy=today.getFullYear()
            let mmm=today.toString().substring(4,7);
            return dd+'-'+mmm+'-'+yyyy
        },

        initStatusHistory: function(userId) {
            let defer = $q.defer()

            API.cui.getPersonDetailedStatusHistory({qs : [
                ['userId', userId], 
                ['startDate','01-Jan-2016'],
                ['lastDate',UserHistory.getTodaysDate()]
            ]})
            .done(res => {               
                defer.resolve(res)
            })
            .fail(err => {
                console.error('Failed getting user status information', err)
                APIError.onFor(errorName + 'initStatusHistory')
                $timeout(() => {
                    APIError.offFor(errorName + 'initStatusHistory')
                }, 5000)
                defer.reject(err)
            })
            return defer.promise
        },

        initPasswordChangeHistory: function(userId) {
            let defer = $q.defer()
            API.cui.getPasswordCangeHistory({personId:userId})
            .then(res => {                
                defer.resolve(res)
            })
            .fail(err => {
                console.error('Failed getting Password change history', err)
                APIError.onFor(errorName + 'initPasswordChangeHistory')
                $timeout(() => {
                    APIError.offFor(errorName + 'initPasswordChangeHistory')
                }, 5000)
                defer.reject(err)
            })
            return defer.promise
        },

        initUserHistory: function(userId, organizationId) {
            let defer = $q.defer()
            let history = {}
            let callsCompleted = 0
            const callsToComplete = 2

            UserHistory.initStatusHistory(userId)
            .then(res => {
                history.statusHistory=res;
            })
            .finally(() => {
                callsCompleted += 1
                if (callsCompleted === callsToComplete) defer.resolve(history)
            })

            UserHistory.initPasswordChangeHistory(userId)
            .then(res => {
                history.passwordChangeHistory=res;
            })
            .finally(() => {
                callsCompleted += 1
                if (callsCompleted === callsToComplete) defer.resolve(history)
            })

            return defer.promise
        },

        injectUI: function(history, $scope, personId) {
            history.fail = false
            history.success = false
        }
    }

    return UserHistory
})
