angular.module('Aggie')

.controller('FetchingController', [
  '$scope',
  '$rootScope',
  'Fetching',
  function($scope, $rootScope, Fetching) {
    $scope.fetchStatus = false;

    Fetching.get(function(enabled) {
      $scope.fetchStatus = enabled;
    });

    $scope.toggleFetching = function() {
      Fetching.set($scope.fetchStatus);
    };
  }
]);
