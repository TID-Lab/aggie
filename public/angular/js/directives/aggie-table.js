angular.module('Aggie')

.directive('aggieTable', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link: function($scope, $el, $attrs) {
        $el.addClass('table');
      }
    };
  }
]);
