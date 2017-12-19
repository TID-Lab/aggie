angular.module('Aggie')

.controller('EmailSettingsModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'emailTransportOptions',
  'FlashService',
  'settingsValues',
  function($scope, $modalInstance, Settings, emailTransportOptions, flash, settings) {
    $scope.transport = {};
    $scope.transport.method = settings.method || {};
    $scope.transport.options = settings.options || {};
    $scope.transport.from = settings.from || {};
    $scope._showErrors = false;
    $scope.emailTransportOptions = emailTransportOptions;

    $scope.save = function() {
      // We first clear previous settings in the configuration
      Settings.clear('email:transport', setSetting, failure);
      $modalInstance.close($scope.transport.method);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function setSetting() {
      // We produce a clean settings object with only the settings for a given method
      settings = { method: $scope.transport.method, options: {} };
      emailTransportOptions[settings.method].forEach(function(setting) {
        settings.options[setting] = $scope.transport.options[setting];
      });

      Settings.set('email:transport', settings, success(settings.method), failure);
    }

    function success(method) {
      flash.setNoticeNow('settings.email.settingsModal.success', { method: method });
    }

    function failure(data) {
      flash.setAlertNow('settings.email.settingsModal.error');
      console.log('failure: ', data);
    }
  }
]);
