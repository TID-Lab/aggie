angular.module('Aggie')

.controller('SourcesIndexController', [
  '$scope',
  '$rootScope',
  'FlashService',
  'sources',
  'Source',
  function($scope, $rootScope, flash, sources, Source) {
    $scope.sources = sources;

    $scope.saveSource = function(source) {
      Source.save({ id: source._id }, source, function() {
      }, function() {
        flash.setAlertNow('source.save.error');
        source.enabled = !source.enabled;
      });
    };

    $scope.refresh = function() {
      Source.query(function(sources) {
        $scope.sources = sources;
      });
    };

    $scope.target = function(source) {
      return source.media == 'twitter' ? source.keywords : source.url;
    };

    $scope.sourceClass = function(source) {
      var mediaOptions = ['twitter', 'facebook', 'rss', 'elmo'];
      if (mediaOptions.indexOf(source.media) !== -1) {
        return source.media + '-source';
      } else {
        return 'unknown-source';
      }
    };

    $scope.viewSource = function(event, source) {
      $rootScope.$state.go('source', { id: source._id });
    };
  }
]);
