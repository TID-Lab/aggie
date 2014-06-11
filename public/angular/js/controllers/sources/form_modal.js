angular.module('Aggie')

.controller('SourceFormModalController', [
  '$rootScope',
  '$scope',
  '$location',
  '$modal',
  'Source',
  'FlashService',
  function($rootScope, $scope, $location, $modal, Source, flash) {
    $scope.create = function() {
      var modalInstance = $modal.open({
        controller: 'SourceFormModalInstanceController',
        templateUrl: 'templates/sources/modal.html',
        resolve: {
          sources: ['Source', function(Source) {
            return Source.query().$promise;
          }],
          locals: function() {
            return {
              action: 'create',
              source: {}
            };
          }
        }
      });

      modalInstance.result.then(function(source) {
        Source.create(source, function(response) {
          flash.setNotice('Source was successfully created.');
          $rootScope.$state.go('source', { id: response._id }, { reload: true });
        }, function(err) {
          flash.setAlertNow('Source failed to be created. Please contact support.');
        });
      });
    };

    $scope.edit = function() {
      var modalInstance = $modal.open({
        controller: 'SourceFormModalInstanceController',
        templateUrl: '/templates/sources/modal.html',
        resolve: {
          sources: ['Source', function(Source) {
            return Source.query().$promise;
          }],
          locals: function() {
            return {
              action: 'edit',
              source: $scope.source
            };
          }
        }
      });

      modalInstance.result.then(function(source) {
        Source.update({ id: source._id }, source, function(response) {
          flash.setNotice('Source was successfully updated.');
          $rootScope.$state.go('source', { id: source._id }, { reload: true });
        }, function() {
            flash.setAlertNow('Source failed to be updated.');
        });
      });
    };
  }
])

.controller('SourceFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'sourceTypes',
  'sources',
  'locals',
  function($scope, $modalInstance, sourceTypes, sources, locals) {
    $scope.sources = sources;
    $scope.sourceTypes = sourceTypes;
    $scope.source = angular.copy(locals.source);
    $scope._showErrors = false

    $scope.sourceClass = function(source) {
      if (source && source.type in sourceTypes) {
        return source.type + '-source';
      } else {
        return 'unknown-source';
      }
    };

    $scope.$watch('source.type', function(sourceType) {
      var url = $scope.source.url;
      if (sourceType == 'facebook') {
        if (!url || url == '') {
          url = 'https://www.facebook.com/';
        }
      } else {
        if (url && url.indexOf('facebook') !== -1) {
          url = '';
        }
      }
      $scope.source.url = url;
    });

    $scope.validSourceType = function(formSource) {
      if (formSource.type != 'twitter') { return true }
      var valid = true;
      $scope.sources.forEach(function(source) {
        valid = valid && (source._id == formSource._id || source.type != 'twitter')
      });
      return valid;
    };

    $scope.$watch('source.type', function(newType, oldType) {
      if (newType == 'twitter') {
        $scope.source.nickname = 'Twitter Search';
      } else if (oldType == 'twitter') {
        $scope.source.nickname = '';
      }
    });

    $scope.showErrors = function() {
      return $scope._showErrors;
    };

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
