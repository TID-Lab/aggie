angular.module('Aggie')

.controller('SourcesShowController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'Source',
  'source',
  'Tags',
  'FlashService',
  function($scope, $rootScope, $stateParams, Source, source, Tags, flash) {
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

    $scope.tagsToString = Tags.tagsToString;
  }
]);
