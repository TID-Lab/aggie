angular.module('Aggie')

.directive('aggieDatepicker', [
  '$parse',
  function($parse) {
    return {
      restrict: 'A',
      scope: {
        model: '=ngModel',
        callback: '&selectDate'
      },
      link: function(scope, el, attrs) {
        el.datetimepicker({
          icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-arrow-up",
            down: "fa fa-arrow-down"
          },
          useSeconds: true,
          defaultDate: scope.model
        });
      }
    };
  }
]);
