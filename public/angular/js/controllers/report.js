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
    $scope.totalItems = 0;
    $scope.keywords = '';
    $scope.sources = {};
    $scope.reports = {};
    $scope.originalReports = {};
    $scope.searchResults = [];

    $scope.isSearching = function() {
      return $scope.searchResults.length > 0;
    };

    Source.query(function(data) {
      data.forEach(function(item) {
        $scope.sources[item._id] = item;
      });
    });

    $scope.fetchPage = function() {
      if ($scope.isSearching()) {
        var results = $scope.searchResults,
          start,
          end;
        $scope.totalItems = results.length;
        start = $scope.startReport() - 1,
        end = $scope.endReport();
        console.log('fetchPage', $scope.totalItems, start, end);
        return $scope.setReports(results.slice(start, end));
      }

      Report.query({page: $scope.currentPage}, function(data) {
        $scope.totalItems = data.total;
        $scope.setReports(data.results);
      });
    };

    $scope.fetchPage();

    $scope.setReports = function(items) {
      $scope.reports = items.filter(function(reports, item) {
        reports[item._id] = item;
        return reports;
      }, {});
      $scope.originalReports = angular.copy($scope.reports);
    };

    $scope.search = function() {
      if ($scope.keywords == '') {
        $scope.searchResults = [];
        return $scope.fetchPage();
      }
      Report.query({keywords: $scope.keywords}, function(data) {
        $scope.searchResults = data.results;
        $scope.currentPage = 0;
        $scope.fetchPage();
      });
    };

    $scope.nextPage = function() {
      if ($scope.currentPage + 1 < $scope.lastPage()) {
        $scope.currentPage += 1;
        $scope.fetchPage();
      }
    };

    $scope.prevPage = function() {
      if ($scope.currentPage > 0) {
        $scope.currentPage -= 1;
        $scope.fetchPage();
      }
    };

    $scope.lastPage = function() {
      return Math.ceil($scope.totalItems / $scope.perPage);
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
      if (page === 0) { return Math.min(perPage, totalItems); }
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
