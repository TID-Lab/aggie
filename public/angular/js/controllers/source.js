angular.module('Aggie')

.controller('SourcesController', [
  '$scope',
  'FlashService',
  'sources',
  'Source',
  function($scope, flash, sources, Source) {
    $scope.sources = sources;

    $scope.toggleEnabled = function(source) {
      source.enabled = !source.enabled;
      this.saveSource(source);
    };

    $scope.saveSource = function(source) {
      Source.save({ id: source._id }, source, function() {
      }, function() {
        flash.setAlertNow("Sorry, but that source couldn't be saved for some reason");
        source.enabled = !source.enabled;
      });
    };

    $scope.refresh = function() {
      Source.query().$promise.then(function(data) {
        $scope.sources = data;
      });
    }

    $scope.target = function(source) {
      return source.type == 'twitter' ? source.keywords : source.url;
    };

    $scope.sourceClass = function(source) {
      return source.type + '-source';
    };
  }
]);
