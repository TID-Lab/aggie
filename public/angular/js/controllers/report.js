angular.module('Aggie')

.controller('ReportsController', [
  '$scope',
  'Report',
  'Source',
  function($scope, Report, Source) {
    $scope.currentPage = 0;
    $scope.perPage = 25;
    $scope.startReport = 1;
    $scope.endReport = $scope.perPage;
    // update with api endpoint for total records
    $scope.totalItems = 309;

    var fetchPage = function() {
      Report.query({page: $scope.currentPage}, function(data) {
        $scope.reports = data;
      });
    };

    fetchPage();

    $scope.nextPage = function() {
      if ($scope.currentPage + 1 < lastPage()) {
        $scope.currentPage += 1;
        fetchPage();
        setReportIndices();
      }
    };

    $scope.prevPage = function() {
      if ($scope.currentPage > 0) {
        $scope.currentPage -= 1;
        fetchPage();
        setReportIndices();
      }
    };

    var lastPage = function() {
      return Math.ceil($scope.totalItems / $scope.perPage);
    };

    var setReportIndices = function() {
      $scope.startReport = startReport();
      $scope.endReport = endReport();
    };

    var startReport = function() {
      var page = $scope.currentPage
      return page > 0
        ? page * $scope.perPage + 1
        : 1;
    };

    var endReport = function() {
      var page = $scope.currentPage
      if (page == 0) return $scope.perPage;
      return page + 1 < lastPage()
        ? page * $scope.perPage + $scope.perPage
        : $scope.totalItems;
    };
  }
]);

