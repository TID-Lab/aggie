angular.module('Aggie')

.controller('SettingsController', [
  '$scope',
  '$window',
  'Settings',
  'UpdateCTList',
  'Source',
  '$timeout',
  '$filter',
  'FlashService',
  'apiSettingsOptions',
  'widgetSettingsOptions',
  function($scope, $window, Settings, UpdateCTList, Source, $timeout, $filter, flash, apiSettingsOptions, widgetSettingsOptions) {

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
      UpdateCTList.update();
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
