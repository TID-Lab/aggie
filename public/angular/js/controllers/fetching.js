angular.module('Aggie')

.controller('FetchingController', [
  '$scope',
  '$rootScope',
  'Fetching',
  'Socket',
  function($scope, $rootScope, Fetching, Socket) {
    $scope.fetchStatus = null;

    var serverFetchStatus = null,
      stopWatchingFetchStatus;

    var init = function() {
      if ($rootScope.currentUser) {
        Fetching.get(setFetchStatus);
        Socket.on('fetchingStatusUpdate', fetchingStatusUpdate);
        stopWatchingFetchStatus = $scope.$watch('fetchStatus', fetchStatusChanged);
      } else {
        Socket.off('fetchingStatusUpdate');
        if (stopWatchingFetchStatus) {
          stopWatchingFetchStatus();
          stopWatchingFetchStatus = null;
        }
      }
    };

    var parseStatus = function(status) {
      if (typeof status == 'string') {
        return status === 'true';
      } else {
        return !!status;
      }
    };

    var fetchingStatusUpdate = function(data) {
      var oldStatus = parseStatus($scope.fetchStatus),
        newStatus = parseStatus(data.fetching);
      if (newStatus === oldStatus) { return }
      serverFetchStatus = newStatus;
      $scope.fetchStatus = newStatus;
    };

    var fetchStatusChanged = function(newStatus, oldStatus) {
      newStatus = parseStatus(newStatus);
      oldStatus = parseStatus(oldStatus);
      if (newStatus === oldStatus || newStatus == serverFetchStatus) { return }
      Fetching.set(newStatus, function() {
        serverFetchStatus = newStatus;
      });
    };

    var setFetchStatus = function(fetchStatus) {
      $scope.fetchStatus = parseStatus(fetchStatus);
    };

    $rootScope.$watch('currentUser', init);

    init();
  }
]);
