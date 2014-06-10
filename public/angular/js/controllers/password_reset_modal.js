angular.module('Aggie').controller('PasswordResetModalController', [
  '$rootScope',
  '$scope',
  '$state',
  '$modal',
  '$http',
  'FlashService',
  function($rootScope, $scope, $state, $modal, $http, flash) {
    $scope.open = function() {
      var modalInstance = $modal.open({
        controller: 'PasswordResetModalInstanceController',
        templateUrl: 'templates/password_reset_modal.html',
      });

      modalInstance.result.then(function(email) {
        $http.post('/reset-password', { email: email })
          .success(function(response) {
            flash.setNoticeNow('An email has been sent to ' +
              email + ' with instructions for resetting your password' );
          })
          .error(function(mesg, status) {
            if (status == 404) {
              flash.setAlertNow('User with email ' +
                email + ' does not exist.');
            } else {
              flash.setAlertNow('There was an error sending the password reset email. Please contact support.');
            }
          });
      });
    };
  }
])

.controller('PasswordResetModalInstanceController', [
  '$scope',
  '$modalInstance',
  function($scope, $modalInstance) {
    $scope.user = { email: '' };

    $scope.okay = function() {
      $modalInstance.close($scope.user.email);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
