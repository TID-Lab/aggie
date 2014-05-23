angular.module('Aggie')

.controller('SourcesShowController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'Source',
  'source',
  'FlashService',
  function($scope, $rootScope, $stateParams, Source, source, flash) {
    $scope.source = source;
    Source.resetUnreadErrorCount({ id: source._id }, source);

    $scope.delete = function() {
      Source.delete({id: $scope.source._id}, function(){
        flash.setNotice('Source was successfully deleted, ' +
          'but reports related to this source will still remain.');
         $rootScope.$state.go('sources');
      }, function() {
        flash.setAlertNow('Source failed to be deleted.');
      });
    };
  }
]);
