angular.module('Aggie')

.controller('EmailSettingsTestModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'FlashService',
  function($scope, $modalInstance, Settings, flash) {
    $scope._showErrors = false;

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope._showErrors = true;
        return;
      }

      Settings.test('email', 'transport', $scope.email, success, failure);

      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function success(method) {
      flash.setNoticeNow('settings.email.testModal.success');
    }

    function failure(data) {
      flash.setAlertNow('settings.email.testModal.error');
      console.log('failure: ', data);
    }

    $scope.showErrors = function() {
      return $scope._showErrors;
    };
  }
]);
