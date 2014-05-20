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
          $location.path('/sources');
        }, function() {
            flash.setAlertNow('Source failed to be created. Please contact support.');
        });
      });
    };
  }
])

.controller('CreateSourceModalInstanceController', [
  '$scope',
  '$modalInstance',
  function($scope, $modalInstance) {
    $scope.sourceTypes = ['twitter', 'facebook', 'RSS', 'ELMO'];
    $scope.source = {};

    $scope.okay = function() {
      $modalInstance.close($scope.source);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
