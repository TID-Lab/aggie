angular.module('Aggie')

.directive('aggieTable', function() {
  return {
    restrict: 'EAC',
    link: function(scope, el) {
      el.addClass('table');
    }
  }
});
