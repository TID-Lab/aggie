angular.module('Aggie')

.controller('SourcesIndexController', [
  '$scope',
  '$rootScope',
  'FlashService',
  'sources',
  'Source',
  'Tags',
  function($scope, $rootScope, flash, sources, Source, Tags) {
    $scope.sources = sources;

    $scope.saveSource = function(source) {
      Source.save({ id: source._id }, source, function() {
      }, function() {
        flash.setAlertNow('source.save.error');
        source.enabled = !source.enabled;
      });
    };

    $scope.target = function(source) {
      return source.media == 'twitter' || source.media == 'smsgh' || source.media == 'whatsapp' || source.media == 'crowdtangle' ? source.keywords : source.url;
    };

    $scope.sourceClass = function(source) {
      
      // keeping the previous mediaoptions incase any of them makes a comeback
      //var mediaOptions = ['twitter', 'facebook', 'rss', 'elmo', 'smsgh', 'whatsapp'];
      
      var mediaOptions = ['twitter', 'crowdtangle'];
      
      if (mediaOptions.indexOf(source.media) !== -1) {
        return source.media + '-source';
      } else {
        return 'unknown-source';
      }
    };

    $scope.viewSource = function(event, source) {
      $rootScope.$state.go('source', { id: source._id });
    };

    $scope.tagsToString = Tags.tagsToString;
  }
]);
