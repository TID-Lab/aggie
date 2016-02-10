angular.module('Aggie')
  .controller('LoginController', [
    '$scope',
    '$state',
    '$rootScope',
    'admin_pwd',
    'AuthService',
    '$location',
    'FlashService',
    function($scope, $state, $rootScope, adminPwd, AuthService, $location, flash) {
      $scope.login = function(form) {
        AuthService.login({
            username: $scope.user.username,
            password: $scope.user.password
          },
          function(err) {
            delete $scope.user;
            if (!err) {
              if ($rootScope.currentUser.username == 'admin'
              && $rootScope.currentUser.hasDefaultPassword) {
                adminPwd.openModal();
              } else {
                $state.go('reports');
              }
            } else {
              flash.setAlertNow(err.data);
            }
          });
      };
    }
  ]);
