angular.module('Aggie')
  .controller('LoginController', [
    '$scope',
    '$state',
    '$rootScope',
    'AuthService',
    '$location',
    'FlashService',
    'Socket',
    function($scope, $state, $rootScope, AuthService, $location, flash, Socket) {
      $scope.login = function(form) {
        AuthService.login({
          username: $scope.user.username,
          password: $scope.user.password
        },
          function(err) {
            if (!err) {
              // Before login, socket should have failed to be created
              // completely
              Socket.recreateConnection();
              $state.go('reports');
            } else {
              flash.setAlertNow(err.data);
            }
          });
      };
    }
  ]);
