angular
.module('app')
.controller('baseCtrl', ['Base', function(Base) {

	var base = this;
	base = Base;
	base.test = 'Ricardo Developer';
	console.log(base);

}]);
