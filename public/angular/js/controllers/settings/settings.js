angular.module('Aggie')

.controller('SettingsController', [
  '$scope',
  '$rootScope',
  '$window',
  'Settings',
  'UpdateCTList',
  'Source',
  '$timeout',
  '$filter',
  'FlashService',
  'Socket',
  'StatsCache',
  function($scope, $rootScope, $window, Settings, UpdateCTList, Source, $timeout, $filter, flash, Socket, StatsCache) {

    var init = function() {
      $scope.stats = StatsCache.get('stats');
      Socket.on('stats', updateStats);
      Socket.join('stats');
    }

    var updateStats = function(stats) {
      StatsCache.put('stats', stats);
      $scope.stats = stats;
    };

    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
