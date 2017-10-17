angular.module('Aggie')

.controller('ResetAdminPasswordController', [
  '$scope',
  '$http',
  '$location',
  'AuthService',
  'shared',
  'FlashService',
  function($scope, $http, $location, AuthService, shared, flash) {
    $scope.passwordMinLength = shared.User.PASSWORD_MIN_LENGTH;
    $scope.user = {};
    $scope.user.password = '';
    $scope.user.passwordConfirmation = '';

    $scope.passwordsMatch = function() {
      return $scope.user.password == $scope.user.passwordConfirmation;
    };

    $scope.isPasswordLongEnough = function() {
      return $scope.user.password.length >= $scope.passwordMinLength;
    };

    $scope.newPwd = function(form) {
      if (!$scope.isPasswordLongEnough()) {
        return flash.setAlertNow('passwordReset.tooShort');
      }

      if (!$scope.passwordsMatch()) {
        return flash.setAlertNow('passwordReset.noMatch');
      }

      $http.put('/reset-admin-password', { password: $scope.user.password })
        .success(function(response) {
          flash.setNotice('passwordReset.admin.success');
          AuthService.logout(function(err) {
            if (!err) {
              flash.setNotice('passwordReset.admin.success');
              $location.url('/login');
            } else {
              console.log('Error', err);
            }
          });
        })
        .error(function(mesg, status) {
          flash.setAlertNow('passwordReset.admin.error');
        });
    };
  }
]);
