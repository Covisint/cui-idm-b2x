angular.module('common')
.factory('applications.getCategoriesFromApps', () => {
    /*
        Receives an array of apps with internationalized categories and returns an array of categories

        usage: API.applications.getCategoriesForApps(applicationArray)
    */
    return (apps) => {
        let categoryArray = []
        const categoryNotInArray = (app) => {
            const categoryIndexInArray = _.findIndex(categoryArray, categoryInArray => (
                _.isEqual(categoryInArray, app.category)
            ))
            return categoryIndexInArray < 0
        }
        apps.forEach(app => {
            if(categoryNotInArray(app)) categoryArray.push(app.category)
        })
        return categoryArray
    }
})