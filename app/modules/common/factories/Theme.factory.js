angular.module('common')
.factory('Theme', ($state, $stateParams) => {

    let Theme = {
        setThemeValues: (values) => {
            Theme.props = values;
        }
    }

    return Theme
})
