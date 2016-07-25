angular.module('common')
.factory('CuiMobileNavFactory', (User) => {
    return {
        title: User.user.organization.name,
        getTitle: function() {
            return this.title
        },
        setTitle: function(newTitle) {
            this.title = newTitle
        }
    }
})
.directive('cuiMobileNav', (CuiMobileNavFactory,$state) => ({
    restrict: 'E',
    scope: {
        showIf: '=',
    	links: '='
    },
    link: (scope, elem, attrs) => {
        attrs.activeTitle ? scope.activeTitle = attrs['activeTitle'] : scope.activeTitle = CuiMobileNavFactory.title
    	scope.currentState = $state.current.name
    	scope.close = () => scope.showIf = false
        scope.toggle = () => scope.showIf =! scope.showIf
    },
    template: `
        <nav class="cui-breadcrumb--mobile" id="breadcrumb-button" aria-hidden="true" ng-click="toggle()" off-click="close()">
  		    <ul class="cui-breadcrumb__links">
                <li class="cui-breadcrumb__link cui-breadcrumb__link--current">
                    <span class="cui-breadcrumb__mobile-link" class="active"><span class="cui-mobile-only">{{activeTitle}}.</span>{{links[currentState]}}</span>
                </li>
                <div class="cui-popover cui-popover--menu cui-breadcrumb__popover cui-popover--top cui-popover__categories-popover" tether target="#breadcrumb-button" attachment="top left" target-attachment="bottom left" offset="-10px 0" ng-if="showIf">
                    <li class="cui-breadcrumb__link cui-popover__row" ng-repeat="(state, name) in links" ng-if="currentState!==state">
                        <a class="cui-breadcrumb__mobile-link" ui-sref="{{state}}">{{name}}</a>
      		        </li>
                </div>
            </ul>
        </nav>
    `
}))
