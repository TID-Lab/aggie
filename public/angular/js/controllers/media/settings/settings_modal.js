angular.module('Aggie')

.controller('MediaSettingsModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'FlashService',
  'settingsValues',
  '$filter',
  function($scope, $modalInstance, Settings, flash, settings, $filter) {

    $scope.settings = settings;
    $scope._showErrors = false;
    $scope.save = function(form, mediaName, settings) {
      settings.configured = true;
      Settings.set('media', mediaName, settings, success(mediaName, 'saved'), failure);
      $modalInstance.close();
    };

    $scope.delete = function(mediaName, settings) {

      for (var setting in settings) {
        settings[setting] = '';
      }

      settings.on = false;
      settings.configured = false;

      Settings.set('media', mediaName, settings, success(mediaName, 'deleted'), failure);
      $modalInstance.close();
    };

    $scope.test = function(mediaName, settings) {
      $scope.success = false;
      $scope.failure = false;
      Settings.test('media', mediaName, settings, successTest, failureTest);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function successTest(response, responseHeaders) {
      if (response.success) {
        $scope.success = true;
      } else {
        $scope.failure = true;
        $scope.message = response.message;
      }
    };

    function failureTest(data) {
      $scope.failure = true;
      $scope.message = 'An error has occurred testing the settings';

      console.log('failure: ', data);
    };

    function success(mediaName, verb) {
      flash.setNoticeNow($filter('capitalize')(mediaName) + ' settings has been successfully ' + verb + '.');
    };

    function failure(data) {
      flash.setAlertNow('An error has occurred');
      console.log('failure: ', data);
    };
  }
]);
