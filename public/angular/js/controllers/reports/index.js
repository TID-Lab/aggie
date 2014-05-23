angular.module('Aggie')

.controller('ReportsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'FlashService',
  'reports',
  'sources',
  'Report',
  'Socket',
  function($state, $scope, $rootScope, $stateParams, flash, reports, sources, Report, Socket) {
    $scope.keywords = $stateParams.keywords || '';
    $scope.currentKeywords = $scope.keywords;
    $scope.startDate = $stateParams.after || '';
    $scope.endDate = $stateParams.before || '';
    $scope.sourceType = $stateParams.sourceType || '';
    $scope.status = $stateParams.status || '';

    var search = function(page) {
      $state.go('reports', searchParams(page));
    };

    var searchParams = function(page) {
      return {
        keywords: $scope.keywords,
        after: $scope.startDate,
        before: $scope.endDate,
        sourceType: $scope.sourceType,
        page: page,
        status: $scope.status
      };
    };

    $scope.newReports = [];
    $scope.newReportsCount = 0;
    var newReportAvailable = function(report) {
      $scope.newReportAvailable = true;
      $scope.newReportsCount += 1;
      if ($scope.newReportsCount > 25) {
        $scope.newReportsCount = 25;
        $scope.newReports.splice(0, 1, report);
      } else {
        $scope.newReports.unshift(report);
      }
    };

    Socket.emit('query', searchParams(null));
    Socket.on('reports', function(report) {
      newReportAvailable(report.results[0]);
    });

    $scope.displayNewReports = function() {
      if ($scope.newReportsCount > 24) {
        $scope.reportsArray = $scope.newReports;
        $scope.reports = paginate($scope.newReports).
          reduce(groupById, {});
      } else {
        var args = [0, $scope.newReports.length].
          concat($scope.newReports);
        Array.prototype.splice.apply($scope.reportsArray, args);
        $scope.reports = paginate($scope.reportsArray).
          reduce(groupById, {});
        $scope.originalReports = angular.copy($scope.reports);
      }
      $scope.newReportAvailable = false;
      $scope.newReportsCount = 0;
      $scope.newReports = [];
    };

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

    $scope.statuses = [
      'relevant', 'irrelevant', 'unassigned', 'assigned'
    ];
    $scope.sources = sources.reduce(groupById, {});
    $scope.reportsArray = reports.results;
    $scope.reports = paginate(reports.results).reduce(groupById, {});
    $scope.originalReports = angular.copy($scope.reports);

    var search = function(page) {
      if (!$scope.keywords.length) { $scope.keywords = null }
      $state.go('reports', {
        keywords: $scope.keywords || null,
        after: $scope.startDate,
        before: $scope.endDate,
        sourceType: $scope.sourceType,
        page: page,
        status: $scope.status
      });
    };

    $scope.search = function() {
      if (!$scope.keywords.length) { $scope.keywords = null }
      search(null);
    };

    $scope.isFirstPage = function() {
      return $scope.pagination.page == 1;
    };

    $scope.isLastPage = function() {
      return $scope.pagination.end >= $scope.pagination.visibleTotal;
    };

    $scope.nextPage = function() {
      if (!$scope.isLastPage()) {
       search($scope.currentPage + 1);
      }
    };

    $scope.prevPage = function() {
      if (!$scope.isFirstPage()) {
        search($scope.currentPage - 1);
      };
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

    $scope.sourceClass = function(report) {
      var source = $scope.sources[report._source],
        sourceTypes = ['twitter', 'facebook', 'rss', 'elmo'];
      if (source && sourceTypes.indexOf(source.type) !== -1) {
        return source.type + '-source';
      } else {
        return 'unknown-source';
      }
    };
  }
]);
