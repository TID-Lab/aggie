angular.module('Aggie')

.controller('UsersIndexController', [
  '$scope',
  '$rootScope',
  'users',
  function($scope, $rootScope, users) {
    $scope.users = users;
  }
]);
