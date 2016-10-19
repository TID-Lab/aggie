angular.module('Aggie')

.directive('ngRound', function() {
  return {
    restrict: 'A',
    scope: true,
    require: 'ngModel',
    link: function(scope, elem, attrs, controller) {
      function round(num) {
        if (!num) return num;
        return Number(num).toFixed(attrs.ngRound || 6);
      }

      controller.$parsers.push(round);
      controller.$formatters.push(round);
    }
  };
});
