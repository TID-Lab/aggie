angular.module('Aggie')

.controller('SourceFormModalController', [
  '$rootScope',
  '$scope',
  '$location',
  '$modal',
  'Source',
  'FlashService',
  function($rootScope, $scope, $location, $modal, Source, flash) {
    $scope.open = function() {
      var modalInstance = $modal.open({
        controller: 'CreateSourceModalInstanceController',
        templateUrl: 'templates/sources/create_modal.html',
      });

      modalInstance.result.then(function(source) {
        Source.create({ source: source }, function(response) {
          flash.setNotice('Source was successfully created.');
          $scope.refresh();
        }, function(err) {
          flash.setAlertNow('Source failed to be created. Please contact support.');
        });
      });
    };
  }
])

.controller('CreateSourceModalInstanceController', [
  '$scope',
  '$modalInstance',
  'sourceTypes',
  function($scope, $modalInstance, sourceTypes) {
    $scope.sourceTypes = sourceTypes;
    $scope.source = {};
    $scope._showErrors = false

    $scope.showErrors = function() {
      return $scope._showErrors;
    }

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope._showErrors = true;
        return;
      }
      $modalInstance.close($scope.source);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
