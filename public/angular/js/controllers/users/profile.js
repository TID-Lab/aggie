var _ = require('underscore');

angular.module('Aggie')

.controller('UsersProfileController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'users',
  'User',
  function($scope, $rootScope, stateParams, users, User) {
    $scope.users = users;

    function init() {
      if ($rootScope.currentUser) {
        $scope.currentUser = $rootScope.currentUser;
        $scope.user = _.find($scope.users, function(u) {
          return u.username === stateParams.userName;
        });
      }
    }

    $rootScope.$watch('currentUser', init);

    init();
  }
]);
