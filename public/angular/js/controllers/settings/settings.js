angular.module('Aggie')

.controller('SettingsController', [
  '$scope',
  '$rootScope',
  '$window',
  'Settings',
  'UpdateCTList',
  'Source',
  '$timeout',
  '$filter',
  'FlashService',
  'apiSettingsOptions',
  'widgetSettingsOptions',
  function($scope, $rootScope, $window, Settings, UpdateCTList, Source, $timeout, $filter, flash, apiSettingsOptions, widgetSettingsOptions) {

    $scope.setting = {};

    apiSettingsOptions.forEach(getSetting);
    widgetSettingsOptions.forEach(getSetting);

    $scope.inHttp = $window.location.protocol === 'http:';
    $scope.apiSettingOptions = apiSettingsOptions;
    $scope.widgetSettingOptions = widgetSettingsOptions;
    $scope.showCTButton = false;

    $scope.checkSource = function(settings) {
      Source.getAll().$promise
      .then(function(response) {
        for (var i = 0; i < response.length; i++) {
          console.log(response[i]);
          if (response[i].media == 'crowdtangle') {
            $scope.showCTButton = true;
          };
        }
      });
    }

    var init = function() {
      $scope.checkSource();
    }

    $scope.updateCTList = function() {
      $rootScope.disableCTButton = true;
      flash.setNoticeNow('Updating CT List', {persist: true});
      UpdateCTList.update().$promise
      .then(function() { flash.setNoticeNow('CT List Updated!') })
      .catch(function() { flash.setAlertNow("Failed to update CT List") })
      .finally(function() { $rootScope.disableCTButton = false });
    }

    function getSetting(name) {
      Settings.get(name, function success(data) {
        $scope.setting[data.setting] = angular.copy(data[data.setting]);
      }, failure);
    }

    function failure(data) {
      flash.setAlertNow('settings.error');
      console.log('failure: ', data);
    }
    init()
  }
]);
