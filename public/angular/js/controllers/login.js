angular.module('Aggie')
  .controller('LoginController', [
    '$scope',
    '$rootScope',
    'AuthService',
    '$location',
    'FlashService',
    function($scope, $rootScope, AuthService, $location, flash) {
      $scope.login = function(form) {
        AuthService.login({
            'username': $scope.user.username,
            'password': $scope.user.password
          },
          function(err) {
            if (!err) {
              flash.setNotice('You have been successfully logged in.');
              $location.path('/');
            } else {
              flash.setAlertNow(err.data);
            }
        });
      };
    }
  ]);
