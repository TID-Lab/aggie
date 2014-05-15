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
    $scope.totalItems = 309;
    $scope.sources = {};
    $scope.reports = {};
    $scope.originalReports = {};

    Source.query(function(data) {
      data.forEach(function(item) {
        $scope.sources[item._id] = item;
      });
    });

    var fetchPage = (function() {
      Report.query({page: $scope.currentPage}, function(data) {
        data.forEach(function(item) {
          $scope.reports[item._id] = item;
        });
        $scope.originalReports = angular.copy($scope.reports);
      });
    })();

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
    }

    $scope.isUnassigned = function(report) {
      return !this.isRelevant(report) && !this.isIrrelevant(report);
    }

    $scope.saveReport = function(report) {
      Report.save({ id: report._id }, report, function() {
      }, function() {
        flash.setAlertNow('Sorry, but that report couldn't be saved for some reason");
        angular.copy($scope.originalReports[report._id], report);
      });
    }
  }
]);

