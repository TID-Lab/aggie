angular.module('Aggie')

.controller('ReportsShowController', [
  '$scope',
  '$stateParams',
  'Report',
  'Source',
  function($scope, $stateParams, Report, Source) {
    Report.get({id: $stateParams.id}, function(report) {
      $scope.report = report;
      $scope.report.content = Autolinker.link( report.content );
      Source.get({id: report._source}, function(source) {
        $scope.source = source;
      });
    });
  }
]);
