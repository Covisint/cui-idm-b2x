angular.module('common')
.directive('cuiSuccessPane', () => ({

	/*
		Usage: 
				<cui-success-pane show-if="scope.variable">
      				<span class="cui-modal__secondary-message">This is extra content</span>
      				<span class="cui-modal__secondary-message">inside the success pane</span>
    			</cui-success-pane>
	*/

    restrict: 'E',
    transclude: true,
    scope: {
         showIf: '='
    },
    link: (scope) => {
        scope.close = () => {
          scope.showIf =! scope.showIf
        }
    },
    template: `
        <div class="cui-modal" ng-if="showIf" ng-click="close()">
            <div class="cui-modal__pane">
            <div class="cui-modal__icon">
                <cui-icon cui-svg-icon="cui:check-with-border" class="cui-modal__icon"></cui-icon>
            </div>
            <span class="cui-modal__primary-message">{{'cui-success' | translate}}</span>
            <ng-transclude></ng-transclude>
            </div>
        </div>
    `
}))
