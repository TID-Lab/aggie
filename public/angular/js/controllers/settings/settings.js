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
  'Socket',
  function($scope, $window, Settings, $timeout, $filter, flash, apiSettingsOptions, widgetSettingsOptions, Socket) {

    $scope.setting = {};

    apiSettingsOptions.forEach(getSetting);
    widgetSettingsOptions.forEach(getSetting);

    $scope.inHttp = $window.location.protocol === 'http:';
    $scope.apiSettingOptions = apiSettingsOptions;
    $scope.widgetSettingOptions = widgetSettingsOptions;

    var init = function() {
      Socket.on('stats', updateStats);
      Socket.join('stats');
    }

    var updateStats = function(stats) {
      $scope.stats = stats;
    };

    function getSetting(name) {
      Settings.get(name, function success(data) {
        $scope.setting[data.setting] = angular.copy(data[data.setting]);
      }, failure);
    }

    function failure(data) {
      flash.setAlertNow('settings.error');
      console.log('failure: ', data);
    }
    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
