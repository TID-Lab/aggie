angular.module('Aggie')

.controller('WidgetSettingsController', [
  '$scope',
  '$window',
  'Settings',
  '$timeout',
  '$filter',
  'FlashService',
  'widgetSettingsOptions',
  'WidgetsSettingsModal',
  function($scope, $window, Settings, $timeout, $filter, flash, widgetSettingsOptions, modal) {

    $scope.widget = {};

    widgetSettingsOptions.forEach(getSetting);

    $scope.edit = function(widget) {
      var modalInstance = modal.create(widget, $scope.widget[widget]);
    };

    $scope.inHttp = $window.location.protocol === 'http:';
    $scope.settingOptions = widgetSettingsOptions;
    $scope.$watch('details.geometry.location', function(newVal, oldVal) {
      if (oldVal === newVal) return;
      console.log('changes in details at modal');
      //$scope.settings['latitude'] = $scope.details.geometry.location.lat();
      //$scope.settings['longitude'] = $scope.details.geometry.location.lng();
    });
    function getSetting(name) {
      Settings.get(name, function success(data) {
        $scope.widget[data.setting] = angular.copy(data[data.setting]);
      }, failure);
    }

    function failure(data) {
      flash.setAlertNow('settings.widget.error');
      console.log('failure: ', data);
    }
  }
]);
