angular.module('Aggie')
  .controller('LoginController', [
    '$scope',
    '$state',
    '$rootScope',
    'AuthService',
    '$location',
    'FlashService',
    'Socket',
    'GPlacesSrc',
    function($scope, $state, $rootScope, AuthService, $location, flash, Socket, GPlacesSrc) {
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
              // Before login, GoogleMaps API would not have loaded
              // properly
              GPlacesSrc.updateSrc();
              $state.go('reports');
            } else {
              flash.setAlertNow(err.data);
            }
          });
      };
    }
  ]);
