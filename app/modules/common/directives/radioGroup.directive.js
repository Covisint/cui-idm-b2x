// Used to approve/yes or deny/no radio buttons 
// both callbacks are optional
// *******usage*******
/* <radio-group model="createPackage.packageViewData.requireAppAdmin"  approve-callback="scope.callback()">

      </radio-group>*/

angular.module('common')
.directive('radioGroup',(Base) => {
	return{
	restrict:'E',
	scope:{
		model: '=',
		id:'@',
		approveCallback: '&?',
		denyCallback:'&?'
	},
	link:(scope,elem, attrs) => {
	    scope.clickCallback = (flag) => {
	    	if (flag && scope.approveCallback) {
	    		scope.approveCallback()
	    	}
	    	else {
	    		if (!flag && scope.denyCallback) {
	    			scope.denyCallback()
	    		};
	    	}
	    }
	},
	template:`
		<fieldset class="cui-flex-table__fieldset">
          <div class="cui-flex-table__right cui-flex-table__multi">
            <div class="cui-radio cui-radio--deny" >
              <input class="cui-radio__input" type="radio" id="{{id}}-deny" ng-value="false" ng-model="model" required />
              <label class="cui-radio__label" for="{{id}}-deny">
                <div class="cui-radio__outer-button" ng-click="clickCallback(flase)"><div class="cui-radio__inner-button"></div></div>
              </label>
            </div>
            <div class="cui-radio cui-radio--approve" >
              <input class="cui-radio__input" type="radio" id="{{id}}-approve" ng-value="true" ng-model="model" required />
              <label class="cui-radio__label" for="{{id}}-approve">
                <div class="cui-radio__outer-button" ng-click="clickCallback(true)"><div class="cui-radio__inner-button"></div></div>
              </label>
            </div>
          </div>
        </fieldset>
	`
}
})