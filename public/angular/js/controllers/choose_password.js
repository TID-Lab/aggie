angular.module('Aggie').controller('ChoosePasswordController', [
  '$rootScope',
  '$scope',
  '$state',
  '$stateParams',
  '$http',
  'AuthService',
  'FlashService',
  'shared',
  function($rootScope, $scope, $state, $stateParams, $http, AuthService, flash, shared) {
    $scope.passwordMinLength = shared.User.PASSWORD_MIN_LENGTH;

    $scope.passwordsMatch = function() {
      return $scope.user.password ===
        $scope.user.password_confirmation;
    };

    $scope.isPasswordLongEnough = function() {
      return $scope.user.password.length >= $scope.passwordMinLength;
    };


    $scope.resetPassword = function() {
      if (!$scope.isPasswordLongEnough()) {
        return flash.setAlertNow('passwordReset.tooShort');
      }

      if (!$scope.passwordsMatch()) {
        return flash.setAlertNow('passwordReset.noMatch');
      }

      var params = {
        token: $stateParams.token,
        password: $scope.user.password
      };

      $http.put('/reset-password', params).success(function(userData) {
        AuthService.login({ username: userData.username, password: params.password }, function(err) {
          if (err) {
            flash.setAlertNow('passwordReset.error');
            $state.go('login');
          } else {
            flash.setNotice('passwordReset.success');
            $state.go('reports');
          }
        });
      }).error(function(message, respStatus) {
        flash.setAlertNow(message);
      });
    };

    $scope.cancel = function() {
      $state.go('login');
    };
  }
]);
