angular.module('Aggie')

.controller('SourcesShowController', [
  '$scope',
  '$stateParams',
  'source',
  'Source',
  function($scope, $stateParams, source, Source) {
    $scope.source = source;
    Source.resetUnreadErrorCount({ id: source._id }, source);
  }
]);
