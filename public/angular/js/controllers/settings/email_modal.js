angular.module('Aggie')

.controller('EmailSettingsModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'emailTransportOptions',
  'FlashService',
  'transport',
  'credentials',
  function($scope, $modalInstance, Settings, emailTransportOptions, flash, transport, credentials) {
    $scope.credentials = credentials;
    $scope.transport = angular.copy(transport);
    $scope._showErrors = false;
    $scope.emailTransportOptions = emailTransportOptions;

    function filterCredentials() {
      $scope.filteredCredentials = $scope.credentials.filter(function (c) {
        return c.type === $scope.transport.method;
      });
    }

    filterCredentials();

    $scope.$watch('transport.method', function(newMethod, oldMethod) {
      filterCredentials();

      if (newMethod && newMethod !== oldMethod) {
        delete $scope.transport.credentials;
      }
    });

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope._showErrors = true;
        return;
      }

      // We first clear previous settings in the configuration
      Settings.clear('email:transport', setSetting, failure);
      $modalInstance.close($scope.transport);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function setSetting() {
      var transport = {
        method: $scope.transport.method,
        credentialsID: $scope.transport.credentials._id,
      }

      Settings.set('email:transport', transport, success($scope.transport.method), failure);
    }

    function success(method) {
      flash.setNoticeNow('settings.email.settingsModal.success', { method: method });
    }

    function failure(data) {
      flash.setAlertNow('settings.email.settingsModal.error');
      console.log('failure: ', data);
    }

    $scope.showErrors = function() {
      return $scope._showErrors;
    };
  }
]);
