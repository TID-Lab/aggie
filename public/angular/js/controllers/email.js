angular.module('Aggie')

.controller('EmailSettingsController', [
  '$scope',
  'Settings',
  '$timeout',
  '$filter',
  'FlashService',
  '$modal',
  function($scope, Settings, $timeout, $filter, flash, $modal) {

    $scope.mail = '';
    $scope.transport = {};
    Settings.get('email', function success(data) {
      $scope.email = data.email.from;
      $scope.transport = angular.copy(data.email.transport);
    }, failure);

    function success() {
      flash.setNoticeNow('The mail setting has been correctly saved');
    }

    $scope.saveEmail = function() {
      Settings.set('email', { from: $scope.email, transport: $scope.transport }, success, failure);
    };

    $scope.editTransport = function() {
      Settings.set('email', { from: $scope.email }, success, failure);
    };

    $scope.editTransport = function() {
      var modalInstance = $modal.open({
        controller: 'EmailSettingsModalInstanceController',
        templateUrl: 'templates/email_modal.html',
        resolve: {
          settingsValues: function() {
            return $scope.transport || {};
          }
        }
      });
      modalInstance.result.then(function(method) {
        $scope.transport.method = method;
      });
    };

    function failure(data) {
      flash.setAlertNow('An error has occurred saving the email setting');
      console.log('failure: ', data);
    }
  }
]);
