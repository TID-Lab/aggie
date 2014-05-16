angular.module('Aggie')

.controller('ReportsController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'Report',
  'Source',
  'FlashService',
  function($state, $scope, $rootScope, $stateParams, Report, Source, flash) {
    $scope.currentPage = 0;
    $scope.perPage = 25;
    $scope.totalItems = 0;
    $scope.keywords = $stateParams.keywords || '';
    $scope.currentKeywords = $scope.keywords;
    $scope.sources = {};
    $scope.reports = {};
    $scope.originalReports = {};
    $scope.searchResults = [];

    Source.query(function(data) {
      data.forEach(function(item) {
        $scope.sources[item._id] = item;
      });
    });

    $scope.fetchPage = function() {
      $scope.currentKeywords = $scope.keywords;
      if ($scope.keywords.length) {
        Report.query({keywords: $scope.keywords}, function(data) {
          $scope.searchResults = data.results;
          $scope.totalItems = data.total;
          $scope.currentPage = 0;
          $scope.updatePage();
        });
      } else {
        Report.query({page: $scope.currentPage}, function(data) {
          $scope.totalItems = data.total;
          $scope.setReports(data.results);
        });
      }
    };

    $scope.updatePage = function() {
      var start = $scope.startReport() - 1,
        end = $scope.endReport();
      $scope.setReports($scope.searchResults.slice(start, end));
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

    $scope.lastPage = function() {
      return Math.ceil($scope.totalItems / $scope.perPage);
    };

    $scope.setReports = function(items) {
      $scope.reports = items.filter(function(reports, item) {
        reports[item._id] = item;
        return reports;
      }, {});
      $scope.originalReports = angular.copy($scope.reports);
    };

    $scope.fetchPage();

    $scope.search = function() {
      if ($scope.keywords == '') {
        $scope.searchResults = [];
        return $scope.fetchPage();
      }
      $state.go('reports', {keywords: $scope.keywords});
    };

    $scope.nextPage = function() {
      if ($scope.currentPage + 1 < $scope.lastPage()) {
        $scope.currentPage += 1;
        $scope.updatePage();
      }
    };

    $scope.prevPage = function() {
      if ($scope.currentPage > 0) {
        $scope.currentPage -= 1;
        $scope.updatePage();
      }
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
