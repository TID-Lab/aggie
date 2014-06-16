angular.module('Aggie')

.controller('DatetimeModalController', [
  '$rootScope',
  '$scope',
  '$state',
  '$modal',
  '$http',
  function($rootScope, $scope, $state, $modal, $http) {
    $scope.open = function() {
      var modalInstance = $modal.open({
        controller: 'DatetimeModalInstanceController',
        templateUrl: 'templates/datetime_modal.html',
        resolve: {
          times: function() {
            return {
              before: $rootScope.$state.params.before,
              after: $rootScope.$state.params.after
            }
          }
        }
      });

      modalInstance.result.then(function(times) {
        $rootScope.$evalAsync(
          $rootScope.$state.$current.locals['@'].
            $scope.search(times));
      });
    };
  }
])

.controller('DatetimeModalInstanceController', [
  '$scope',
  '$modalInstance',
  'times',
  function($scope, $modalInstance, times) {
    $scope.datetimes = times;

    $scope.okay = function() {
      $modalInstance.close($scope.datetimes);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
