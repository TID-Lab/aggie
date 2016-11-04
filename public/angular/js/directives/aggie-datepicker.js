angular.module('Aggie')

.directive('aggieDatepicker', [
  'aggieDateFilter',
  'tz',
  function(aggieDateFilter, tz) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, el, attrs, ngModel) {
        ngModel.$formatters.unshift(function(modelValue) {
          if (!modelValue) { return; }
          return aggieDateFilter(modelValue, 'datepicker');
        });

        ngModel.$parsers.unshift(function(viewValue) {
          var modelValue = tz(Date.parse(viewValue), '%FT%T');
          if (typeof modelValue === 'function') { return; }
          return modelValue;
        });

        el.datetimepicker({
          icons: {
            time: 'fa fa-clock-o',
            date: 'fa fa-calendar',
            up: 'fa fa-arrow-up',
            down: 'fa fa-arrow-down'
          },
          useSeconds: true
        });

        ngModel.$render = function() {
          el.data('DateTimePicker').setDate(ngModel.$viewValue);
        };

        el.on('dp.change', function() {
          ngModel.$setViewValue(el.val());
        });
      }
    };
  }
]);
