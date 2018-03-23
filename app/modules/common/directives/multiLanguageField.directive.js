// Used to add multiple languages for a field
/* ****** inputs *********
 scope.name={ 
			languages:[],
			label:'cui-name',
			required:true
		}
form -- actual form name in which the field is in for validation
label-class -- for different styling of the field label
name -- input name for validation
// ******** usage ******
/*
<multi-language-field options="scope.name" name="'name'" form="summary" label-class="'cui-flex-table__title'"></multi-language-field>
*/

angular.module('common')
.directive('multiLanguageField',(Base) => {
	return{
	restrict:'E',
	scope:{
		name: '=',
		form: '=',
		options:'=',
		labelClass:'='
	},
	link:(scope,elem, attrs,ctrl ) => {
		// Get language Data for dropDown
		scope.languages=[]
		Object.keys(Base.languages).forEach(function(id,index){
			if (id!='en') {
				scope.languages.push({id:id})
			};
	    })
	    Object.values(Base.languages).forEach(function(language,index){
	        if (language!='English') {
	        	scope.languages[index-1].name=language; 
	        };
	    })
	    
	},
	template:`
		<div class="cui-wizard__field-row">
			<div class="cui-wizard__field-container cui-wizard__field-container--half">
			  <label class="{{labelClass}}">{{options.label | translate}}</label>
			  <div class="cui-error" ng-messages="form[name].$error" ng-if="form[name].$dirty">
			    <div class="cui-error__message" ng-message="required">{{'cui-this-field-is-required' | translate}}</div>
			  </div>
			  <input type="text" name="{{name}}" class="cui-input" ng-required="options.required" ng-model="options.english"/>
			</div>
			<div class="cui-wizard__field-container cui-wizard__field-container--half cui-wizard__field-container--button">
			    <button class="cui-button" ng-click="options.languages.push({text:'',lang:''})">{{'cui-add' |translate}} {{'more-languages' |translate}}</button>
			</div>
		</div>
		<div class="cui-wizard__field-row" ng-repeat="language in options.languages track by $index">
			<div class="cui-wizard__field-container cui-wizard__field-container--half">
			  <div class="cui-error" ng-messages="form[name+$index].$error" ng-if="form[name+$index].$dirty">
			    <div class="cui-error__message" ng-message="required">{{'cui-this-field-is-required' | translate}}</div>
			  </div>
			  <input type="text" name="{{name+$index}}" class="cui-input" ng-required="options.required" ng-model="language.text"/>
			</div>
			<div class="cui-wizard__field-container cui-wizard__field-container--half cui-wizard__field-container--button">
			    <cui-dropdown ng-model="language.lang" class="cui-dropdown" return-value="object.id" display-value="object.name" options="languages"></cui-dropdown>
			</div>
		</div>
	`
}
})