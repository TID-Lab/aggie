angular.module('Aggie')

.controller('DatetimeModalController', [
  '$scope',
  '$state',
  '$modal',
  'tz',
  function($scope, $state, $modal, tz) {
    $scope.open = function() {
      var modalInstance = $modal.open({
        controller: 'DatetimeModalInstanceController',
        templateUrl: 'templates/datetime_modal.html',
        resolve: {
          times: function() {
            var before = $state.params.before,
              after = $state.params.after;

            if (!before && !after) {
              before = tz(new Date(), '+1 day', '%F%00:00:00');
              after = tz(new Date(), '%F%00:00:00');
            }

            return { before: before, after: after };
          }
        }
      });

      modalInstance.result.then(function(times) {
        $scope.search(times);
      });
    };
  }
])

.controller('DatetimeModalInstanceController', [
  '$scope',
  '$state',
  '$modalInstance',
  'times',
  'aggieDateFilter',
  'tz',
  function($scope, $state, $modalInstance, times, aggieDateFilter, tz) {
    $scope.times = times;
    $scope.showErrors = false;

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope.showErrors = true;
        return;
      }

      $modalInstance.close($scope.times);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.clear = function() {
      $scope.times = {};
      $state.params.before = null;
      $state.params.after = null;
    };
  }
]);
