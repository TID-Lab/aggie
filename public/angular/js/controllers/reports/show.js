angular.module('Aggie')

.controller('ReportsShowController', [
  '$scope',
  '$stateParams',
  'data',
  'Report',
  'Tags',
  function($scope, $stateParams, data, Report, Tags) {
    $scope.report = data.report;
    $scope.sources = data.sources;
    $scope.markAsRead = function(report) {
      if (report.read) return;
      report.read = true;
      Report.save({ id: report._id }, report);
    };
    $scope.tagsToString = Tags.tagsToString;
    $scope.markAsRead(data.report);
  }
]);
