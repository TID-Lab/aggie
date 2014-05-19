angular.module('Aggie')

.controller('ReportsController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'FlashService',
  'reports',
  'sources',
  function($state, $scope, $rootScope, $stateParams, flash, reports, sources) {
    $scope.keywords = $stateParams.keywords || '';
    $scope.currentKeywords = $scope.keywords;

    $scope.pagination = {
      page: parseInt($stateParams.page) || 1,
      total: reports.total,
      visibleTotal: reports.total,
      perPage: 25,
      start: 0,
      end: 0
    };

    var groupById = function(memo, item) {
      memo[item._id] = item;
      return memo;
    };

    var paginate = function(items) {
      var page = $scope.pagination.page,
        perPage = $scope.pagination.perPage,
        total = $scope.pagination.total,
        start = (page - 1) * perPage,
        end = (page * perPage) - 1;

      $scope.pagination.start = start + 1;
      $scope.pagination.end = Math.min(end + 1, total);

      if ($scope.keywords.length) {
        $scope.pagination.visibleTotal = items.length;
        return items.slice(start, end);
      } else {
        return items;
      }
    }

    $scope.sources = sources.reduce(groupById, {});
    $scope.reports = paginate(reports.results).reduce(groupById, {});
    $scope.originalReports = angular.copy($scope.reports);

    $scope.search = function() {
      if (!$scope.keywords.length) { $scope.keywords = null }
      $state.go('reports', { keywords: $scope.keywords, page: null });
    };

    $scope.isFirstPage = function() {
      return $scope.pagination.page == 1;
    };

    $scope.isLastPage = function() {
      return $scope.pagination.end >= $scope.pagination.visibleTotal;
    };

    $scope.nextPage = function() {
      if (!$scope.isLastPage()) {
        $state.go('reports', { keywords: $scope.keywords, page: $scope.currentPage + 1 });
      }
    };

    $scope.prevPage = function() {
      if (!$scope.isFirstPage()) {
        $state.go('reports', { keywords: $scope.keywords, page: $scope.currentPage - 1 });
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

    $scope.paginationTotalLabel = function() {
      if ($scope.pagination.total > $scope.pagination.visibleTotal) {
        return $scope.pagination.visibleTotal + '+';
      } else {
        return $scope.pagination.visibleTotal;
      }
    }
  }
]);
