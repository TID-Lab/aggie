angular.module('Aggie')

.directive('aggieToggle', function() {
  return {
    restrict: 'E',
    replace: false,
    template: '<div class="toggle-item" ng-repeat="(status, label) in options" ng-click="toggleStatus(status)" ng-class="{ selected: isStatus(status) }">{{label}}</div>',

    scope: {
      toggle: '=',
      options: '=',
      allowBlank: '@',
      onChange: '&onChange'
    },

    controller: [
      '$scope',
      '$timeout',
      function($scope, $timeout) {
        $scope.toggleStatus = function(status) {
          var originalStatus = $scope.currentStatus();
          if ($scope.allowBlank == 'true') {
            $scope.toggle = $scope.isStatus(status) ? '' : status
          } else {
            $scope.toggle = status;
          }
          if ($scope.toggle !== originalStatus) {
            $timeout($scope.onChange);
          }
        };

        $scope.currentStatus = function() {
          var toggle = $scope.toggle;
          if (toggle == undefined) { toggle = '' }
          return toggle.toString();
        }

        $scope.isStatus = function(status) {
          return $scope.currentStatus() === status;
        };
      }
    ],

    link: function($scope, $el) {
      $el.click(function(e) {
        e.stopPropagation();
      });
    }
  };
});
