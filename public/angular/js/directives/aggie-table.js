angular.module('Aggie')

.directive('aggieTable', function() {
  return {
    restrict: 'EAC',
    transclude: true,
    link: function(scope, el) {
      el.addClass('table');
    }
  }
});
