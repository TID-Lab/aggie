angular.module('Aggie')

.controller('FetchingController', [
  '$scope',
  '$rootScope',
  'Fetching',
  function($scope, $rootScope, Fetching) {
    $rootScope.fetchStatus = false;

    Fetching.get(function(enabled) {
      $rootScope.fetchStatus = enabled;
    });

    $scope.toggleFetching = function() {
      Fetching.set($rootScope.fetchStatus);
    };
  }
]);
