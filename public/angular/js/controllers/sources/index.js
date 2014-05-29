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
        flash.setAlertNow("Sorry, but that source couldn't be saved for some reason");
        source.enabled = !source.enabled;
      });
    };

    $scope.refresh = function() {
      Source.query(function(sources) {
        $scope.sources = sources;
      });
    };

    $scope.target = function(source) {
      return source.type == 'twitter' ? source.keywords : source.url;
    };

    $scope.sourceClass = function(source) {
      var sourceTypes = ['twitter', 'facebook', 'rss', 'elmo'];
      if (sourceTypes.indexOf(source.type) !== -1) {
        return source.type + '-source';
      } else {
        return 'unknown-source';
      }
    };

    $scope.viewSource = function(event, source) {
      $rootScope.$state.go('source', { id: source._id });
    };
  }
]);
