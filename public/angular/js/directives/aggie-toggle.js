angular.module('Aggie')

.directive('aggieToggle', function() {
  return {
    restrict: 'E',
    replace: false,
    template:
        '<div class="btn-group" role="switch" aria-label="Source Toggle">' +
        '  <button class="btn" ng-repeat="(status, label) in options" ' +
        '          ng-click="toggleStatus(status)" ng-disabled="isStatus(status)" ng-class="{\n' +
        '              \'btn-primary\':isStatus(status), \'btn-secondary\':!isStatus(status)}">{{label}}</button>' +
        '</div>',

    scope: {
      toggle: '=',
      options: '=',
      allowBlank: '@',
      boolean: '@',
      onChange: '&onChange'
    },

    controller: [
      '$scope',
      '$timeout',
      function($scope, $timeout) {
        $scope.toggleStatus = function(status) {
          var originalStatus = $scope.currentStatus();
          if ($scope.allowBlank == 'true') {
            $scope.toggle = $scope.isStatus(status) ? '' : processStatus(status);
          } else {
            $scope.toggle = processStatus(status);
          }
          if ($scope.toggle !== originalStatus) {
            $timeout($scope.onChange);
          }
        };

        var processStatus = function(status) {
          if ($scope.boolean == undefined) {
            return status;
          } else {
            return status == 'true';
          }
        };

        $scope.currentStatus = function() {
          var toggle = $scope.toggle;
          if (toggle == undefined) { toggle = ''; }
          return processStatus(toggle.toString());
        };

        $scope.isStatus = function(status) {
          return $scope.currentStatus() === processStatus(status);
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
