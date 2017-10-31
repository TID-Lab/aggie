angular.module('Aggie')

.controller('WidgetsSettingsModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'FlashService',
  'settingsValues',
  'widget',
  '$filter',
  function($scope, $modalInstance, Settings, flash, settings, widget, $filter) {

    $scope.settings = settings;
    console.log(settings);
    $scope.widget = widget;
    $scope._showErrors = false;
    $scope.loading = false;
    $scope.minimalLatLng = true;
    console.log('before');
    $scope.$watch('details.geometry.location', function(newVal, oldVal) {
      console.log('changes in details');
      if (oldVal === newVal) return;
      $scope.settings['latitude'] = $scope.details.geometry.location.lat();
      $scope.settings['longitude'] = $scope.details.geometry.location.lng();
    });

    $scope.save = function(form, widgetName, settings) {
      Settings.set(widgetName, settings, success(widgetName, 'saved'), failure);
      $modalInstance.close();
    };

    $scope.delete = function(widgetName, settings) {

      for (var setting in settings) {
        settings[setting] = '';
      }

      Settings.set(widgetName, settings, success(widgetName, 'deleted'), failure);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function success(widgetName, verb) {
      flash.setNoticeNow('settings.widget.settingsModal.success',
                         { widgetName: $filter('capitalize')(widgetName),
                           verb: verb });
    }

    function failure(data) {
      flash.setAlertNow('settings.widget.settingsModal.error');
      console.log('failure: ', data);
    }
  }
]);
