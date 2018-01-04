angular.module('Aggie')

.controller('SettingsController', [
  '$scope',
  '$window',
  'Settings',
  '$timeout',
  '$filter',
  'FlashService',
  'apiSettingsOptions',
  'widgetSettingsOptions',
  function($scope, $window, Settings, $timeout, $filter, flash, apiSettingsOptions, widgetSettingsOptions) {

    $scope.setting = {};

    apiSettingsOptions.forEach(getSetting);
    widgetSettingsOptions.forEach(getSetting);

    $scope.inHttp = $window.location.protocol === 'http:';
    $scope.apiSettingOptions = apiSettingsOptions;
    $scope.widgetSettingOptions = widgetSettingsOptions;

    function getSetting(name) {
      Settings.get(name, function success(data) {
        $scope.setting[data.setting] = angular.copy(data[data.setting]);
      }, failure);
    }

    function failure(data) {
      flash.setAlertNow('settings.error');
      console.log('failure: ', data);
    }
  }
]);
