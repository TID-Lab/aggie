angular.module('Aggie')

.directive('aggieusername', function() {
  return {
    replace: false,
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.push(function(modelValue, viewValue) {
        // consider null valid (error for required)
        // NOTE: if we upgrade to Angular v1.3.x, this is
        // properly handled by $validators in ctrl
        if (modelValue && !modelValue.match(/^(\w){1,15}$/)) {
          ctrl.$setValidity('aggieusername', false);
          return undefined;
        } else {
          ctrl.$setValidity('aggieusername', true);
          return modelValue;
        }
      });
    }
  };
});
