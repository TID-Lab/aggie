angular.module('Aggie')

.controller('SourcesShowController', [
  '$scope',
  '$stateParams',
  'Source',
  'source',
  function($scope, $stateParams, Source, source) {
    $scope.source = source;
    Source.resetUnreadErrorCount({ id: source._id }, source);
  }
]);
