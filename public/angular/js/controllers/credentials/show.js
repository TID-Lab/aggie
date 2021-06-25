angular.module('Aggie')

.controller('CredentialsShowController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'Credentials',
  'credentials',
  'sources',
  'FlashService',
  'Socket',
  'StatsCache',
  function($scope, $rootScope, $stateParams, Credentials, credentials, sources, flash, Socket, StatsCache) {
    $scope.credentials = credentials;

    $scope.sources = sources.filter(function (source) {
        return source.credentials._id === credentials._id;
    });

    var init = function() {
      $scope.stats = StatsCache.get('stats');
      Socket.on('stats', updateStats);
      Socket.join('stats');
    }
    var updateStats = function(stats) {
      StatsCache.put('stats', stats);
      $scope.stats = stats;
    };
    $scope.delete = function() {
      Source.delete({ id: $scope.source._id }, function() {
        flash.setNotice('credentials.delete.success');
        $rootScope.$state.go('sources');
      }, function() {
        flash.setAlertNow('credentials.delete.error');
      });
    };

    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });

    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
