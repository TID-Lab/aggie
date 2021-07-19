'use strict';

angular.module('Aggie')

.controller('CredentialsFormModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  'Credentials',
  'FlashService',
  '$translate',
  '$state',
  function($rootScope, $scope, $modal, Credentials, flash) {
    $scope.create = function() {
      var modalInstance = $modal.open({
        controller: 'CredentialsFormModalInstanceController',
        templateUrl: 'templates/credentials/modal.html',
        resolve: {
          credentials: function() {
            return {
              credentials: {}
            };
          }
        }
      });

      modalInstance.result.then(function(credentials) {
        $scope.credentials.push(credentials);
        flash.setNoticeNow('credentials.create.success');
      });
    };
  }
])

.controller('CredentialsFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'credentialsTypes',
  'credentials',
  'Credentials',
  '$translate',
  'FlashService',
  'shared',
  function($scope, $modalInstance, credentialsTypes, credentials, Credentials, $translate, flash, shared) {
    $scope.credentialsTypes = credentialsTypes;
    $scope.credentials = angular.copy(credentials);
    $scope.showErrors = false;
    $scope.message = '';

    var handleSuccess = function(response) {
      $modalInstance.close(response);
    };

    var handleError = function(response) {
      $translate(response.data).then(function(error) {
        $scope.message = error;
      }).catch(function() {
        $scope.message = 'credentials.create.error';
      });
    };

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope.showErrors = true;
        return;
      }
      Credentials.save($scope.credentials, handleSuccess, handleError);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
