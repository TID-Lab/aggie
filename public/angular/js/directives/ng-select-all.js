angular.module('Aggie')

.directive('ngSelectAll', function() {
  return {
    restrict: 'A',
    scope: {
      items: '='
    },

    link: function($scope, $el, attrs) {
      $el.on('click', function() {
        var checked = $el[0].checked;

        angular.forEach($scope.items, function(item) {
          item.selected = checked;
        });

        $scope.$apply();
      });
    }
  };
});
