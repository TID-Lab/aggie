angular.module('Aggie').controller('ChoosePasswordController', [
  '$rootScope',
  '$scope',
  '$state',
  '$stateParams',
  '$http',
  'AuthService',
  'FlashService',
  function($rootScope, $scope, $state, $stateParams, $http, AuthService, flash) {
    $scope.passwordsMatch = function() {
      return $scope.user.password ==
        $scope.user.password_confirmation;
    };

    $scope.resetPassword = function() {
      if (!$scope.passwordsMatch()) {
        return flash.setAlertNow('Passwords do not match');
      }

      var params = {
        token: $stateParams.token,
        password: $scope.user.password
      };

      $http.put('/reset-password', params).success(function() {
        flash.setNotice('Your password has been set successfully.');
        $state.go('reports');
      }).error(function(message, respStatus) {
        flash.setAlertNow(message);
      });
    };

    $scope.cancel = function() {
      $state.go('login');
    };
  }
]);
