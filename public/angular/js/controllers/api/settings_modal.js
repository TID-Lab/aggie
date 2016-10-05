angular.module('Aggie')

.controller('APISettingsModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'FlashService',
  'settingsValues',
  'api',
  '$filter',
  function($scope, $modalInstance, Settings, flash, settings, api, $filter) {

    $scope.settings = settings;
    $scope.api = api;
    $scope._showErrors = false;
    $scope.loading = false;

    $scope.save = function(form, apiName, settings) {
      Settings.set(apiName, settings, success(apiName, 'saved'), failure);
      $modalInstance.close();
    };

    $scope.delete = function(apiName, settings) {

      for (var setting in settings) {
        settings[setting] = '';
      }

      Settings.set(apiName, settings, success(apiName, 'deleted'), failure);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function success(apiName, verb) {
      flash.setNoticeNow('settings.api.settingsModal.success',
                         { apiName: $filter('capitalize')(apiName),
                           verb: verb });
    };

    function failure(data) {
      flash.setAlertNow('settings.api.settingsModal.error');
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
