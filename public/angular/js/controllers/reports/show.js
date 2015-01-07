angular.module('Aggie')

.controller('ReportsShowController', [
  '$scope',
  '$stateParams',
  'data',
  function($scope, $stateParams, data) {
    $scope.report = data.report;
    $scope.source = data.source;
  }
]);
