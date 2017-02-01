angular.module('common')
.directive('unique', ['$parse', ($parse) => {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: (scope, element, attrs, ctrl) => {
      const checkIfUnique = (values) => {
        ctrl.$setValidity('unique', values[0] !== (values[1] || ''));
      };

      scope.$watch(()=> [scope.$eval(attrs.unique), ctrl.$viewValue], checkIfUnique, (newValues,oldValues) => angular.equals(newValues,oldValues));
    }
  };
}]);