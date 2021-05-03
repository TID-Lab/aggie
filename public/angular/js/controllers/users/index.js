angular.module('Aggie')

.controller('UsersIndexController', [
  '$scope',
  '$rootScope',
  'FlashService',
  'users',
  'User',
  'Socket',
  'StatsCache',
  function($scope, $rootScope, flash, users, User, Socket, StatsCache) {
    $scope.users = users;

    var init = function() {
      $scope.stats = StatsCache.get('stats');
      Socket.on('stats', updateStats);
      Socket.join('stats');
    }
    var updateStats = function(stats) {
      StatsCache.put('stats', stats);
      $scope.stats = stats;
    };
    $scope.delete = function(user) {
      User.delete({ _id: user._id }, function() {
        flash.setNoticeNow('user.delete.success');
        for (var i in $scope.users) {
          if (user._id == $scope.users[i]._id) {
            $scope.users.splice(i, 1);
          }
        }
      }, function() {
        flash.setAlertNow('user.delete.error');
      });
    };
    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
