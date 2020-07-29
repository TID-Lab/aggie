angular.module('Aggie')

.controller('ReportsShowController', [
  '$scope',
  '$stateParams',
  '$window',
  'data',
  'Report',
  'Tags',
  'Socket',
  function($scope, $stateParams, $window, data, Report, Tags, Socket) {
    var init = function() {
      Socket.on('stats', updateStats);
      Socket.join('stats');
    };
    var updateStats = function(stats) {
      $scope.stats = stats;
    };
    var toggleFlagged = function(items, flagged) {
      return items.map(function(item) {
        item.flagged = flagged;
        return item;
      });
    };

    $scope.report = data.report;
    $scope.sources = data.sources;
    $scope.markAsRead = function (report) {
      if (report.read) return;
      report.read = true;
      Report.save({id: report._id}, report);
    };
    $scope.tagsToString = Tags.tagsToString;
    $scope.markAsRead(data.report);

    $scope.toggleFlagged = function(report) {
      report.flagged = !report.flagged;

      if (report.flagged) {
        report.read = report.flagged;
      }

      $scope.saveReport(report);
    };
    $scope.$back = function() {
      $window.history.back();
    };

    init();
  }
]);

angular.module('Aggie')

.filter('trusted', ['$sce', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);
