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

    function getSetting(name, index, mediaItems) {
      Settings.get(name, function success(data) {
        $scope.media[data.setting] = angular.copy(data[data.setting]);
      }, failure);
    }

    function failure(data) {
      flash.setAlertNow('settings.media.error');
      console.log('failure: ', data);
    }
  }
]);
