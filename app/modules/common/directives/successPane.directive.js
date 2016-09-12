angular.module('common')
.directive('cuiSuccessPane', ($state,$timeout) => ({

	/*****
		--- Usage ---

        <cui-success-pane show-if="scope.variable" close-after="5000" on-close="scope.functionName()">
      		<p class="cui-modal__secondary-message">This is extra content</p>
      		<p class="cui-modal__secondary-message">{{scope.object.name}}</p>
    	</cui-success-pane>

        --- Optional Paramaters ---

            close-after - specify how long before the success pane automatically closes
                        - if timer is not specified, the pane will stay open until clicked

            on-close    - specify what scope function to fire when the modal closes
	*****/

    restrict: 'E',
    transclude: true,
    scope: {
        showIf: '=',
        closeAfter: '=',
        onClose: '&'
    },
    link: (scope) => {
        scope.close = () => {
            scope.showIf =! scope.showIf
        }

        if (scope.closeAfter) {
            $timeout(() => {
                if (scope.onClose) {
                    scope.onClose() && scope.onClose()();
                }
                scope.close()
            }, scope.closeAfter)
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
