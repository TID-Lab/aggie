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
        resolve: {
          sources: ['Source', function(Source) {
            return Source.query().$promise;
          }]
        }
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
  'sources',
  function($scope, $modalInstance, sourceTypes, sources) {
    $scope.sources = sources;
    $scope.sourceTypes = sourceTypes;
    $scope.source = {};
    $scope._showErrors = false

    $scope.sourceClass = function(source) {
      if (source && source.type in sourceTypes) {
        return source.type + '-source';
      } else {
        return 'unknown-source';
      }
    };

    $scope.validSourceType = function(newSource) {
      if (newSource.type != 'twitter') { return true }
      var valid = true;
      $scope.sources.forEach(function(source) {
        valid = valid && source.type != 'twitter';
      });
      return valid;
    };

    $scope.$watch('source.type', function(newType, oldType) {
      if (newType == 'twitter') {
        $scope.source.nickname = 'Twitter Source';
      }
      if (oldType == 'twitter') {
        $scope.source.nickname = '';
      }
    });

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
