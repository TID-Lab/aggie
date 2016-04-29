angular.module('Aggie')
  .controller('LoginController', [
    '$scope',
    '$state',
    '$rootScope',
    'AuthService',
    '$location',
    'FlashService',
    function($scope, $state, $rootScope, AuthService, $location, flash) {
      $scope.login = function(form) {
        AuthService.login({
            username: $scope.user.username,
            password: $scope.user.password
          },
          function(err) {
            if (!err) {
              $state.go('reports');
            } else {
              flash.setAlertNow(err.data);
            }
        });
      };
    }
  ]);
