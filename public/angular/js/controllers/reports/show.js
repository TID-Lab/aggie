angular.module('Aggie')

.controller('ReportsShowController', [
  '$scope',
  '$stateParams',
  'Report',
  'Source',
  function($scope, $stateParams, Report, Source) {
    Report.get({id: $stateParams.id}, function(report) {
      $scope.report = report;
      Source.get({id: report._source}, function(source) {
        $scope.source = source;
      });
    });
  }
]);
