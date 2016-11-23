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
          flash.setNotice('source.create.success');
          $rootScope.$state.go('source', { id: response._id }, { reload: true });
        }, function(err) {
          flash.setAlertNow('source.create.error');
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
          flash.setNotice('source.update.success');
          $rootScope.$state.go('source', { id: source._id }, { reload: true });
        }, function() {
          flash.setAlertNow('source.update.error');
        });
      });
    };
  }
])

.controller('SourceFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'mediaOptions',
  'sources',
  'locals',
  function($scope, $modalInstance, mediaOptions, sources, locals) {
    $scope.sources = sources;
    $scope.mediaOptions = mediaOptions;
    $scope.source = angular.copy(locals.source);
    $scope._showErrors = false;

    $scope.sourceClass = function(source) {
      if (source && mediaOptions.indexOf(source.media) !== -1) {
        return source.media + '-source';
      } else {
        return 'unknown-source';
      }
    };

    $scope.$watch('source.media', function(sourceMedia) {
      var url = $scope.source.url;
      if (sourceMedia === 'facebook') {
        if (!url || url === '') {
          url = 'https://www.facebook.com/';
        }
      } else {
        if (url && url.indexOf('facebook') !== -1) {
          url = '';
        }
      }
      $scope.source.url = url;
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
