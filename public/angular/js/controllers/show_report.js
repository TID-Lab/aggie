angular.module('Aggie')

.controller('ShowReportController', [
  '$scope',
  '$stateParams',
  'Report',
  'Source',
  function($scope, $stateParams, Report, Source) {
    Report.get({id: $stateParams.id}, function(r) {
      $scope.report = r;
      Source.get({id: r._source}, function(s) {
        $scope.source = s;
      });
    });
  }
])
