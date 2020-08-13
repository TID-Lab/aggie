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
  function($scope, $rootScope, $stateParams, Source, source, Tags, flash, Socket) {
    $scope.source = source;
    Source.resetUnreadErrorCount({ id: source._id }, source);
    var init = function() {
      Socket.on('stats', updateStats);
      Socket.join('stats');
    }
    var updateStats = function(stats) {
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
