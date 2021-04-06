var _ = require('underscore');

angular.module('Aggie')

.controller('UsersProfileController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'users',
  'User',
  'Socket',
  'StatsCache',
  function($scope, $rootScope, stateParams, users, User, Socket, StatsCache) {
    $scope.users = users;
    var init = function() {
      $scope.stats = StatsCache.get('stats');
      Socket.on('stats', updateStats);
      Socket.join('stats');
      if ($rootScope.currentUser) {
        $scope.currentUser = $rootScope.currentUser;
        $scope.user = _.find($scope.users, function(u) {
          return u.username === stateParams.userName;
        });
      }

    }
    var updateStats = function(stats) {
      StatsCache.put('stats', stats);
      $scope.stats = stats;
    };
    $rootScope.$watch('currentUser', init);
    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
