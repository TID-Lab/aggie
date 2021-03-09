var _ = require('underscore');

angular.module('Aggie')

.controller('UsersProfileController', [
  '$scope',
  '$rootScope',
  '$transition$',
  'users',
  'User',
  'Socket',
  function($scope, $rootScope, $transition$, users, User, Socket) {
    var stateParams = $transition$.params();

    $scope.users = users;
    var init = function() {
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
