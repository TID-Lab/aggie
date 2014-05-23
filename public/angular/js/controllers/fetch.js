angular.module('Aggie')

.controller('FetchingController', [
  '$scope',
  '$rootScope',
  'Fetching',
  'Socket',
  function($scope, $rootScope, Fetching, Socket) {
    $scope.fetchStatus == null;

    var parseStatus = function(status) {
      if (typeof status == 'string') {
        return status === 'true';
      } else {
        return !!status;
      }
    }

    Fetching.get(function(fetchStatus) {
      $scope.fetchStatus = parseStatus(fetchStatus);
    });

    Socket.on('fetchingStatusUpdate', function(data) {
      var oldStatus = parseStatus($scope.fetchStatus),
        newStatus = parseStatus(data.fetching);
      if (newStatus === oldStatus) { return }
      $scope.fetchStatus = newStatus;
    });

    $scope.$watch('fetchStatus', function(newStatus, oldStatus) {
      newStatus = parseStatus(newStatus);
      oldStatus = parseStatus(oldStatus);
      if (newStatus === oldStatus) { return }
      Fetching.set(newStatus);
    });
  }
]);
