angular.module('Aggie')

.controller('MediaSettingsModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'FlashService',
  'settingsValues',
  'media',
  '$filter',
  function($scope, $modalInstance, Settings, flash, settings, media, $filter) {

    $scope.settings = settings;
    $scope.media = media;
    $scope._showErrors = false;

    $scope.save = function(form, mediaName, settings) {
      settings.configured = true;
      Settings.set(mediaName, settings, success(mediaName, 'saved'), failure);
      $modalInstance.close();
    };

    $scope.delete = function(mediaName, settings) {

      for (var setting in settings) {
        settings[setting] = '';
      }

      settings.on = false;
      settings.configured = false;

      Settings.set(mediaName, settings, success(mediaName, 'deleted'), failure);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function success(mediaName, verb) {
      flash.setNoticeNow($filter('capitalize')(mediaName) + ' settings has been successfully ' + verb + '.');
    };

    function failure(data) {
      flash.setAlertNow('An error has occurred');
      console.log('failure: ', data);
    };
  },
]);
