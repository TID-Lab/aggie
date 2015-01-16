angular.module('Aggie')

.controller('ReportsShowController', [
  '$scope',
  '$stateParams',
  'data',
  'Report',
  function($scope, $stateParams, data, Report) {
    $scope.report = data.report;
    $scope.source = data.source;
  
    $scope.markAsRead = function(report) {
      if (report.read) return;
      report.read = true;
      Report.save({ id: report._id }, report);
    }

    $scope.markAsRead(data.report);
  }
]);
