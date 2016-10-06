angular.module('Aggie')

.controller('APISettingsController', [
  '$scope',
  '$window',
  'Settings',
  '$timeout',
  '$filter',
  'FlashService',
  'apiSettingsOptions',
  'APISettingsModal',
  function($scope, $window, Settings, $timeout, $filter, flash, apiSettingsOptions, modal) {

    $scope.api = {};

    apiSettingsOptions.forEach(getSetting);

    $scope.edit = function(api) {
      var modalInstance = modal.create(api, $scope.api[api]);
    };

    $scope.inHttp = $window.location.protocol === 'http:';
    $scope.settingOptions = apiSettingsOptions;

    function getSetting(name) {
      Settings.get(name, function success(data) {
        $scope.api[data.setting] = angular.copy(data[data.setting]);
      }, failure);
    }

    function failure(data) {
      flash.setAlertNow('settings.api.error');
      console.log('failure: ', data);
    }
  }
]);
