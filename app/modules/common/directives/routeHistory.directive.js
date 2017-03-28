/*
TODO
    -strategically handle jumps?
        - best bet is to just display last 3 routes in markup
*/

angular.module('common')
.factory('CuiRouteHistoryFactory', () => {
    var routes = [];
    /*
        route: {
            text: '',
            uiroute: '',
            uirouteparams: ''
        }
    */
    return {
        add: function(route) {
            routes.push(route);
            return;
        },
        remove: function(route) {
            _.remove(routes, {text: route.text});
            return;
        },
        truncate: function(route) {
            // Remove everything that follows route
            var idx = routes.indexOf(route);
            cui.log('truncate before', routes, route, idx);
            if (idx !== -1) {
                routes = routes.slice(0, idx);
            }
            cui.log('truncate after', routes);
            return;
        },
        clear: function() {
            routes = [];
            return;
        },
        get: function() {
            return routes;
        }
    }
})
.directive('cuiRouteHistory', (CuiRouteHistoryFactory, $state) => ({
    restrict: 'E',
    link: (scope, elem, attrs) => {
        //scope.currentState = $state.current.name;
        scope.routes = CuiRouteHistoryFactory.get();
        scope.go = function(route) {
            if (route.uiroute && route.uiroute !== $state.current.name) {
                CuiRouteHistoryFactory.truncate(route);
                if (route.uirouteparams) {
                    $state.go(route.uiroute, route.uirouteparams);   
                } else {
                    $state.go(route.uiroute);   
                }
            }
        };
    },
    template: `
        <nav class="cui-breadcrumb">
            <ul class="cui-breadcrumb__links">
              <li class="cui-breadcrumb__link" ng-repeat="route in routes | limitTo:-3">
                <span ng-class="{'cui-breadcrumb__route':!$last, 'cui-breadcrumb__routelast':$last}" ng-click="go(route)">{{route.text}}</span>
              </li>
            </ul>
        </nav>
    `
    //            <a ng-if="route.uiroute !== null" ui-sref="{{route.uiroute}}">{{route.text}}</a>
}))
