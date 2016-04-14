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

    mediaSettingsOptions.forEach(getSetting);

    $scope.mediaOptions = mediaSettingsOptions;
    $scope.edit = function(media) {
      var modalInstance = modal.create(media, $scope.media[media]);
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
