angular.module('common')
.factory('CuiMobileNavFactory', (PubSub,User,$filter) => {
    return {
        title: User.user.organization.name,
        defaultTitle: User.user.organization.name,
        getTitle: function() {
            return this.title
        },
        setTitle: function(newTitle) {
            this.title = newTitle
            PubSub.publish('mobileNavTitleChange')
        },
        getDefaultTitle: function() {
            return this.defaultTitle
        },
        setDefaultTitle: function(newDefaultTitle) {
            this.defaultTitle = newDefaultTitle
        }
    }
})
.directive('cuiMobileNav', (CuiMobileNavFactory,PubSub,$state) => ({
    restrict: 'E',
    scope: {
        showIf: '=',
        links: '=',
        activeTitle:'@activeTitle',
        label: '=?'
    },
    link: (scope, elem, attrs) => {
        // attrs.activeTitle ? scope.activeTitle = attrs.activeTitle : scope.activeTitle = CuiMobileNavFactory.getDefaultTitle()
        scope.currentState = $state.current.name

        scope.close = () => scope.showIf = false
        scope.toggle = () => scope.showIf =! scope.showIf

        const pubSubSubscription = PubSub.subscribe('mobileNavTitleChange', () => {
            // scope.activeTitle = CuiMobileNavFactory.getTitle()
        })

        scope.$on('$destroy', () => {
            PubSub.unsubscribe(pubSubSubscription)
        })
    },
    template: `
        <nav class="cui-breadcrumb--mobile" id="breadcrumb-button" aria-hidden="true" ng-click="toggle()" off-click="close()">
            <ul class="cui-breadcrumb__links">
                <li class="cui-breadcrumb__link cui-breadcrumb__link--current">
                    <span class="cui-breadcrumb__mobile-link" ng-if="links[currentState]" class="active"><span class="cui-mobile-only" ng-if="activeTitle">{{activeTitle}}.</span>{{links[currentState].label}}</span>
                    <span class="cui-breadcrumb__mobile-link" ng-if="!links[currentState]" class="active"><span class="cui-mobile-only" ng-if="activeTitle">{{activeTitle}}.</span>{{label}}</span>
                </li>
                <div class="cui-popover cui-popover--menu cui-breadcrumb__popover cui-popover--top cui-popover__categories-popover" tether target="#breadcrumb-button" attachment="top left" target-attachment="bottom left" offset="-10px 0" ng-if="showIf">
                    <li class="cui-breadcrumb__link cui-popover__row" ng-repeat="(state, stateDetails) in links" ng-if="currentState!==state">
                        <a class="cui-breadcrumb__mobile-link" ui-sref="{{state}}(stateDetails.stateParams)">{{stateDetails.label}}</a>
                    </li>
                </div>
            </ul>
        </nav>
    `
}))
