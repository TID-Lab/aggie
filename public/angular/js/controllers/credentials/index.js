'use strict';

angular.module('Aggie')

.controller('CredentialsIndexController', [
  '$scope',
  '$rootScope',
  'FlashService',
  'credentials',
  'Credentials',
  'Socket',
  'StatsCache',
  function($scope, $rootScope, flash, credentials, Credentials, Socket, StatsCache) {
    $scope.credentials = credentials;

    var updateStats = function(stats) {
      StatsCache.put('stats', stats);
      $scope.stats = stats;
    };
    var init = function() {
      $scope.stats = StatsCache.get('stats');
      Socket.on('stats', updateStats);
      Socket.join('stats');
    };
    $scope.delete = function(credentials) {
      Credentials.delete({ _id: credentials._id }, function() {
        flash.setNoticeNow('credentials.delete.success');
        for (var i in $scope.credentials) {
          if (credentials._id === $scope.credentials[i]._id) {
            $scope.credentials.splice(i, 1);
          }
        }
      }, function() {
        flash.setAlertNow('credentials.delete.error');
      });
    };
    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
