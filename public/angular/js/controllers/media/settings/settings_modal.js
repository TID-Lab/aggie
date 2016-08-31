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
    $scope.loading = false;

    $scope.save = function(form, mediaName, settings) {
      Settings.set(mediaName, settings, success(mediaName, 'saved'), failure);
      $modalInstance.close();
    };

    $scope.delete = function(mediaName, settings) {

      for (var setting in settings) {
        settings[setting] = '';
      }

      Settings.set(mediaName, settings, success(mediaName, 'deleted'), failure);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function success(mediaName, verb) {
      flash.setNoticeNow('settings.media.settingsModal.success',
                         { mediaName: $filter('capitalize')(mediaName),
                           verb: verb });
    };

    function failure(data) {
      flash.setAlertNow('settings.media.settingsModal.error');
      console.log('failure: ', data);
    };

    $scope.test = function(mediaName, settings) {
      $scope.success = false;
      $scope.failure = false;
      $scope.loading = true;
      Settings.test('media', mediaName, settings, successTest, failureTest);
    };

    function successTest(response, responseHeaders) {
      $scope.loading = false;

      if (response.success) {
        $scope.success = true;
      } else {
        $scope.failure = true;
        $scope.message = response.message;
      }
    };

    function failureTest(data) {
      $scope.loading = false;

      $scope.failure = true;
      $scope.message = data.message;
    };
  },
]);
