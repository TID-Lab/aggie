angular.module('Aggie')

.controller('MediaSettingsController', [
  '$scope',
  'Settings',
  '$timeout',
  '$filter',
  'FlashService',
  'mediaSettingsOptions',
  'MediaSettingsModal',
  function($scope, Settings, $timeout, $filter, flash, mediaSettingsOptions, modal) {

    $scope.media = {};
    var item;
    var mediaName;
    for (item in mediaSettingsOptions) {
      mediaName = mediaSettingsOptions[item];
      Settings.get(mediaName, function success(data) {
        $scope.media[data.setting] = angular.copy(data[data.setting]);
      }, failure);
    }

    $scope.mediaOptions = mediaSettingsOptions;
    $scope.edit = function(media) {
      var modalInstance = modal.create(media, $scope.media[media]);
    };

    $scope.toggle = function(mediaName, value) {
      var media = $scope.media[mediaName];
      var setting = {};

      setting.on = value;

      if ((value && media.configured) || !value) {
        Settings.set('media', mediaName, setting, success(mediaName, setting, value), failure);
      } else {
        var modalInstance = modal.create(mediaName, media);
      };
    };

    function success(mediaName, setting, value) {
      $scope.media[mediaName].on = value;
      flash.setNoticeNow(mediaName.charAt(0).toUpperCase() + mediaName.slice(1) + ' has been successfully modified.');
    };

    function failure(data) {
      flash.setAlertNow('An error has occurred setting the media status');
      console.log('failure: ', data);
    };

  }
]);
