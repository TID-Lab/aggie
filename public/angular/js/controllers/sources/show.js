angular.module('Aggie')

.controller('SourcesShowController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$translate',
  'Source',
  'source',
  'Tags',
  'twitterLanguageOptions',
  'FlashService',
  function($scope, $rootScope, $stateParams, $translate, Source, source, Tags, twitterLanguageOptions, flash) {
    $scope.source = source;
    Source.resetUnreadErrorCount({ id: source._id }, source);

    $scope.delete = function() {
      Source.delete({ id: $scope.source._id }, function() {
        flash.setNotice('source.delete.success');
        $rootScope.$state.go('sources');
      }, function() {
        flash.setAlertNow('source.delete.error');
      });
    };

    $scope.acceptedLanguages = '';

    if (source.media === 'twitter') {
      for (var i = 0; i < source.acceptedLanguages.length; i++) {
        var lang = source.acceptedLanguages[i];
        $scope.acceptedLanguages += ' ' + $translate.instant(twitterLanguageOptions[lang]);
      }
    }

    $scope.tagsToString = Tags.tagsToString;
  }
]);
