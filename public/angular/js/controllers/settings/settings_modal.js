angular.module('Aggie')
.controller('SettingsModalController', [
  '$scope',
  '$modal',
  function($scope, $modal) {
    $scope.edit = function(item, settings, set) {
      var modalInstance = $modal.open({
        controller: 'SettingsModalInstanceController',
        templateUrl: 'templates/' + set + '-settings-modal.html',
        resolve: {
          item: function() {
            return item;
          },
          settingsValues: function() {
            return settings;
          }
        }
      });
    };
  }])
.controller('SettingsModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'FlashService',
  'settingsValues',
  'item',
  '$filter',
  function($scope, $modalInstance, Settings, flash, settings, item, $filter) {
    $scope.settings = settings;
    $scope.item = item;
    $scope._showErrors = false;
    $scope.loading = false;
    $scope.minimalLatLng = true;

    $scope.save = function(form, itemName, settings) {
      Settings.set(itemName, settings, success(itemName, 'saved'), failure);
      $modalInstance.close();
    };

    $scope.delete = function(itemName, settings) {

      for (var setting in settings) {
        settings[setting] = '';
      }

      Settings.set(itemName, settings, success(itemName, 'deleted'), failure);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    function success(itemName, verb) {
      flash.setNoticeNow('settings.settingsModal.success',
                         { itemName: $filter('capitalize')(itemName),
                           verb: verb });
    }

    function failure(data) {
      flash.setAlertNow('settings.settingsModal.error');
      console.log('failure: ', data);
    }

    $scope.test = function(mediaName, settings) {
      $scope.success = false;
      $scope.failure = false;
      $scope.loading = true;
      Settings.test('media', mediaName, settings, successTest, failureTest);
    };

    function successTest(response) {
      $scope.loading = false;

      if (response.success) {
        $scope.success = true;
      } else {
        $scope.failure = true;
        $scope.message = response.message;
      }
    }

    function failureTest(data) {
      $scope.loading = false;

      $scope.failure = true;
      $scope.message = data.message;
    }

    $scope.$watch('details.geometry.location', function(newVal, oldVal) {
      if (oldVal === newVal) return;
      $scope.settings['latitude'] = $scope.details.geometry.location.lat();
      $scope.settings['longitude'] = $scope.details.geometry.location.lng();
    });

  }
]);
