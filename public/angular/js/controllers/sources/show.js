angular.module('Aggie')

.controller('SourcesShowController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'Source',
  'source',
  'Tags',
  'FlashService',
  'Socket',
  'StatsCache',
  function($scope, $rootScope, $stateParams, Source, source, Tags, flash, Socket, StatsCache) {
    $scope.source = source;

    Source.resetUnreadErrorCount({ id: source._id }, source);
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
        flash.setNotice('source.delete.success');
        $rootScope.$state.go('sources');
      }, function() {
        flash.setAlertNow('source.delete.error');
      });
    };

    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });

    $scope.tagsToString = Tags.tagsToString;
    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
