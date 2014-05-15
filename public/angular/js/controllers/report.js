angular.module('Aggie')

.controller('ReportsController', [
  '$scope',
  '$rootScope',
  'Report',
  'Source',
  'FlashService',
  function($scope, $rootScope, Report, Source, flash) {
    $scope.currentPage = 0;
    $scope.perPage = 25;
    $scope.startReport = 1;
    $scope.endReport = $scope.perPage;
    // update with api endpoint for total records
    $scope.totalItems = 0;
    $scope.sources = {};
    $scope.reports = {};
    $scope.originalReports = {};

    Source.query(function(data) {
      data.forEach(function(item) {
        $scope.sources[item._id] = item;
      });
    });

    var fetchPage = function() {
      Report.query({page: $scope.currentPage}, function(data) {
        $scope.totalItems = data.total;
        var reports = {};
        data.results.forEach(function(item) {
          reports[item._id] = item;
        });
        $scope.reports = reports;
        $scope.originalReports = angular.copy($scope.reports);
      });
    };

    fetchPage();

    $scope.nextPage = function() {
      if ($scope.currentPage + 1 < $scope.lastPage()) {
        $scope.currentPage += 1;
        fetchPage();
      }
    };

    $scope.prevPage = function() {
      if ($scope.currentPage > 0) {
        $scope.currentPage -= 1;
        fetchPage();
      }
    };

    $scope.lastPage = function() {
      return Math.ceil($scope.totalItems / $scope.perPage);
    };

    $scope.setReportIndices = function() {
      $scope.startReport = startReport();
      $scope.endReport = endReport();
    };

    $scope.startReport = function() {
      var page = $scope.currentPage,
        perPage = $scope.perPage;
      return page > 0 ? page * perPage + 1 : 1;
    };

    $scope.endReport = function() {
      var page = $scope.currentPage,
        perPage = $scope.perPage,
        totalItems = $scope.totalItems,
        lastPage = $scope.lastPage();
      if (page === 0) { return perPage; }
      return page + 1 < lastPage ? page * perPage + perPage : totalItems;
    };

    $scope.rotateStatus = function(report) {
      if (report.status == 'relevant') {
        report.status = 'irrelevant';
      } else if (report.status == 'irrelevant') {
        report.status = '';
      } else {
        report.status = 'relevant';
      }
      this.saveReport(report);
    };

    $scope.isRelevant = function(report) {
      return report.status == 'relevant';
    };

    $scope.isIrrelevant = function(report) {
      return report.status == 'irrelevant';
    };

    $scope.isUnassigned = function(report) {
      return !this.isRelevant(report) && !this.isIrrelevant(report);
    };

    $scope.saveReport = function(report) {
      Report.save({ id: report._id }, report, function() {
      }, function() {
        flash.setAlertNow("Sorry, but that report couldn't be saved for some reason");
        angular.copy($scope.originalReports[report._id], report);
      });
    };
  }
]);
