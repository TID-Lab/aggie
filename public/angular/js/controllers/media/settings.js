angular.module('Aggie')

.controller('MediaSettingsController', [
  '$scope',
  '$window',
  'Settings',
  '$timeout',
  '$filter',
  'FlashService',
  'mediaSettingsOptions',
  'MediaSettingsModal',
  function($scope, $window, Settings, $timeout, $filter, flash, mediaSettingsOptions, modal) {

    $scope.media = {};

    mediaSettingsOptions.forEach(getSetting);

    $scope.mediaOptions = mediaSettingsOptions;
    $scope.edit = function(media) {
      var modalInstance = modal.create(media, $scope.media[media]);
    };

    $scope.inHttp = $window.location.protocol === 'http:';

    $scope.toggle = function(mediaName, value) {
      var mediaSettings = $scope.media[mediaName];
      var setting = {};

      setting.on = value;

      if (value && mediaSettings.configured || !value) {
        Settings.set(mediaName, setting, success(mediaName, setting, value), failure);
      } else {
        var modalInstance = modal.create(mediaName, mediaSettings);
      };
    };

    function getSetting(name, index, mediaItems) {
      Settings.get(name, function success(data) {
        $scope.media[data.setting] = angular.copy(data[data.setting]);
      }, failure);

    };
    function success(mediaName, setting, value) {
      $scope.media[mediaName].on = value;
    };

    function failure(data) {
      flash.setAlertNow('An error has occurred setting the media status');
      console.log('failure: ', data);
    };
  },
]);
