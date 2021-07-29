angular.module('Aggie')

.controller('EmailSettingsController', [
  '$scope',
  'Settings',
  '$timeout',
  '$filter',
  'FlashService',
  '$modal',
  function($scope, Settings, $timeout, $filter, flash, $modal) {
    $scope.credentials = $scope.$parent.credentials;
    Settings.get('email', function success(data) {
      $scope.email = data.email.from;
      $scope.method = data.email.transport.method;
      $scope.selectedCredentials = $scope.credentials.find(function (c) { return c._id === data.email.transport.credentialsID });
    }, failure);

    function success() {
      flash.setNoticeNow('settings.email.success');
    }

    $scope.saveEmail = function() {
      Settings.set('email', {
        from: $scope.email,
        method: $scope.method,
        credentialsID: $scope.selectedCredentials._id
      }, success, failure);
    };

    $scope.editCredentials = function() {
      var modalInstance = $modal.open({
        controller: 'EmailSettingsModalInstanceController',
        templateUrl: 'templates/email_modal.html',
        resolve: {
          transport: function() {
            return {
              method: $scope.method,
              credentials: $scope.selectedCredentials
            }
          },
          credentials: function() {
            return $scope.credentials
          }
        }
      });
      modalInstance.result.then(function(transport) {
        $scope.method = transport.method;
        $scope.selectedCredentials = transport.credentials;
      });
    };

    $scope.testEmail = function() {
      $modal.open({
        controller: 'EmailSettingsTestModalInstanceController',
        templateUrl: 'templates/email_test_modal.html',
      });
    };

    function failure(data) {
      flash.setAlertNow('settings.email.error');
      console.log('failure: ', data);
    }
  }
]);
