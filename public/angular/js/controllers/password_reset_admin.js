angular.module('Aggie')

.controller('ResetAdminPasswordController', [
  '$scope',
  '$http',
  '$state',
  'shared',
  'FlashService',
  function($scope, $http, $state, shared, flash) {
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
      if (!$scope.passwordsMatch()) {
        $scope.showErrors = true;
        return;
      }

      $http.put('/reset-admin-password', { password: $scope.user.password })
        .success(function(response) {
          flash.setNotice('The admin password was changed successfully.');
          $state.go('reports');
        })
        .error(function(mesg, status) {
          flash.setAlertNow('There was an error setting the new admin password.');
        });
    };
  }
]);
