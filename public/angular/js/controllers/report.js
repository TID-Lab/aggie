angular.module('Aggie')

.controller('ReportsController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'Report',
  'Source',
  'FlashService',
  'reports',
  'sources',
  function($state, $scope, $rootScope, $stateParams, Report, Source, flash, reports, sources) {
    $scope.currentPage = parseInt($stateParams.page) || 1;
    $scope.perPage = 25;
    $scope.keywords = $stateParams.keywords || '';
    $scope.currentKeywords = $scope.keywords;

    var filterById = function(memo, item) {
      memo[item._id] = item;
      return memo;
    };

    $scope.totalItems = reports.total;
    $scope.sources = sources.filter(filterById, {});
    $scope.reports = reports.results.filter(filterById, {});
    $scope.originalReports = angular.copy($scope.reports);

    /*
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
    */

    $scope.startReport = function() {
      var page = $scope.currentPage,
        perPage = $scope.perPage;
      return page > 1 ? (page - 1) * perPage + 1 : 1;
    };

    $scope.endReport = function() {
      var page = $scope.currentPage,
        perPage = $scope.perPage,
        totalItems = $scope.totalItems,
        lastPage = $scope.lastPage();
      if (page === 1) { return Math.min(perPage, totalItems); }
      return page < lastPage ? (page - 1) * perPage + perPage : totalItems;
    };

    $scope.lastPage = function() {
      return Math.ceil($scope.totalItems / $scope.perPage);
    };

    /*
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
    */

    $scope.nextPage = function() {
      if ($scope.currentPage < $scope.lastPage()) {
        $state.go('reports', { page: $scope.currentPage + 1 });
      }
    };

    $scope.prevPage = function() {
      if ($scope.currentPage > 1) {
        $state.go('reports', { page: $scope.currentPage - 1 });
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

    $scope.viewReport = function(event, report) {
      if (angular.element(event.target)[0].tagName == 'TD') {
        $state.go('report', { id: report._id });
      }
    };
  }
]);
