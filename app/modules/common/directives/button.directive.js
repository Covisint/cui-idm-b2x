angular.module('common')
.directive('cuiButton', () => ({
    restrict: 'E',
    transclude: true,
    scope: {
        errorIf: '=',
        loadingIf: '=',
        successIf: '=',
        buttonClick: '&'
    },
    template: `
        <button class="cui-button cui-button--error-alt" ng-if="errorIf" ng-click="buttonClick()">
          Error, click to try again
        </button>
        <button class="cui-button cui-button--loading-alt" ng-if="loadingIf">
          <span>Loading</span>
          <div class="cui-button__ellipses"></div>
          <div class="cui-button__ellipses"></div>
          <div class="cui-button__ellipses"></div>
        </button>
        <button class="cui-button cui-button--success" ng-if="successIf">
          Success!
          <svg class="cui-button__check" width="21px" height="16px" viewBox="0 0 21 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>check</title>
              <g id="check" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <path d="M0.824056194,14.5726523 C1.60584855,15.3483885 2.86333934,15.3420834 3.63455864,14.5567179 L11.8587648,6.18165837 C12.62917,5.39712184 13.9014742,5.37922301 14.6979727,6.13923477 L17.3615817,8.68082663 C18.1592277,9.44193325 19.4283055,9.41819274 20.1974828,8.62642494 L19.932337,8.89935798 C20.700916,8.10820614 20.673432,6.84262122 19.8821394,6.08333201 L14.6486407,1.06149931 C13.8523384,0.297402956 12.5724404,0.323089801 11.8099641,1.09847731 L1.07504371,12.0151757 C0.303588289,12.7996944 0.31135936,14.063927 1.09376039,14.8402672 L0.824056194,14.5726523 Z" fill="currentColor" transform="translate(10.500000, 7.826229) rotate(-180.000000) translate(-10.500000, -7.826229) "></path>
              </g>
          </svg>
        </button>
        <ng-transclude ng-if="!loadingIf && !errorIf && !successIf" ng-click="buttonClick()">
        </ng-translude>
    `
}))
