angular.module('Aggie')

.controller('AdminChoosePasswordModalInstanceController', [
  '$scope',
  '$modalInstance',
  '$http',
  'FlashService',
  function($scope, $modalInstance, $http, flash) {
    $scope.passwordsMatch = function() {
      return $scope.user.password ==
        $scope.user.passwordConfirmation;
    };

    $scope.user = {};
    $scope.user.password = '';

    $scope.newPwd = function() {

      if (!$scope.passwordsMatch()) {
        return;
      }

      $http.put('/reset-admin-password', { password: $scope.user.password })
        .success(function(response) {
          //flash.setAlertNow('The admin password was changed successfully.');
          $modalInstance.close();
        })
        .error(function(mesg, status) {
          flash.setAlertNow('There was an error setting the new admin password.');
        });
    };
  }
]);
