angular.module('Aggie')

.controller('AdminChoosePasswordModalController', [
  '$scope',
  '$modal',
  function($scope, $modal) {
    // Do we need this?

  }
])

.controller('AdminChoosePasswordModalInstanceController', [
  '$scope',
  '$modalInstance',
  '$http',
  'FlashService',
  function($scope, $modalInstance, $http, flash) {
    $scope.passwordsMatch = function() {
      return $scope.user.password ==
        $scope.user.password_confirmation;
    };

    $scope.user = {};
    $scope.user.password = '';

    $scope.newPwd = function() {

      if (!$scope.passwordsMatch()) {
        return flash.setAlertNow('Passwords do not match');
      }

      console.log($scope);
      $http.put('/reset-admin-password', { password: $scope.user.password })
          .success(function(response) {
            $modalInstance.close();
          })
          .error(function(mesg, status) {
            flash.setAlertNow('There was an error setting the new admin password.');
          });

    };
  }
]);
