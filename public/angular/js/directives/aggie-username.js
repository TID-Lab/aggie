angular.module('Aggie')

.directive('aggieusername', function() {
  return {
    replace: false,
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (modelValue, viewValue) {
        if (!modelValue.match(/^@?(\w){1,15}$/)) {
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
