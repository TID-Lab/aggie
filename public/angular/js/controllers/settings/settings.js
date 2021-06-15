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
  'Socket',
  'StatsCache',
  function($scope, $rootScope, $window, Settings, UpdateCTList, Source, $timeout, $filter, flash, apiSettingsOptions, widgetSettingsOptions, Socket, StatsCache) {

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
          if (response[i].media === 'facebook' || response[i].media === 'instagram') {
            $scope.showCTButton = true;
          };
        }
      });
    }

    $scope.updateCTList = function() {
      $rootScope.disableCTButton = true;
      flash.setNoticeNow('settings.ctUpdate.pending', {persist: true});
      UpdateCTList.update().$promise
      .then(function() { flash.setNoticeNow('settings.ctUpdate.success') })
      .catch(function() { flash.setAlertNow('settings.ctUpdate.failure') })
      .finally(function() { $rootScope.disableCTButton = false });
    }

    var init = function() {
      $scope.checkSource();
      $scope.stats = StatsCache.get('stats');
      Socket.on('stats', updateStats);
      Socket.join('stats');
    }

    var updateStats = function(stats) {
      StatsCache.put('stats', stats);
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
