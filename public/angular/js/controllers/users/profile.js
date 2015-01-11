angular.module('Aggie')

.controller('UsersProfileController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'users',
  'User',
  function($scope, $rootScope, stateParams, users, User) {
    $scope.users = users;

    function init () {
      if (!stateParams["userId"] || stateParams["userId"] == "") {
        $scope.user = $rootScope.currentUser;
      } else {
        for (var x = 0; x < $scope.users.length; x++) {
          if ($scope.users[x]._id === stateParams.userId) {
            $scope.user = $scope.users[x];
          }
        }
      }
    }

    $rootScope.$watch('currentUser', init);

    init();
  }
]);
