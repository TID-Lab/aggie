angular.module('Aggie')

.controller('ReportsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  '$timeout',
  '$stateParams',
  'FlashService',
  'reports',
  'sources',
  'sourceTypes',
  'incidents',
  'statusOptions',
  'Report',
  'Socket',
  'Queue',
  'paginationOptions',
  function($state, $scope, $rootScope, $timeout, $stateParams, flash, reports, sources, sourceTypes, incidents, statusOptions, Report, Socket, Queue, paginationOptions) {
    $scope.searchParams = $stateParams;
    $scope.reports = reports.results;
    $scope.reportsById = {};
    $scope.sources = sources;
    $scope.sourcesById = {};
    $scope.incidents = incidents.results;
    $scope.incidentsById = {};
    $scope.visibleReports = new Queue(paginationOptions.perPage);
    $scope.newReports = new Queue(paginationOptions.perPage);
    $scope.sourceTypes = sourceTypes;
    $scope.statusOptions = statusOptions;

    $scope.pagination = {
      page: parseInt($stateParams.page) || 1,
      total: reports.total,
      visibleTotal: reports.total,
      perPage: paginationOptions.perPage,
      start: 0,
      end: 0
    };

    var init = function() {
      $scope.reportsById = $scope.reports.reduce(groupById, {});
      $scope.sourcesById = $scope.sources.reduce(groupById, {});
      $scope.incidentsById = $scope.incidents.reduce(groupById, {});

      var visibleReports = paginate($scope.reports);
      $scope.visibleReports.addMany(visibleReports);

      if ($scope.isFirstPage()) {
        Socket.emit('query', searchParams());
        Socket.on('reports', $scope.handleNewReports);
      }

      Socket.on('reportStatusChanged', $scope.updateReportStatus);
    };

    var removeDuplicates = function(reports) {
      return reports.reduce(function(memo, report) {
        if (!(report._id in $scope.reportsById)) {
          $scope.reportsById[report._id] = report;
          memo.push(report);
        }
        return memo;
      }, []);
    };

    var groupById = function(memo, item) {
      memo[item._id] = item;
      return memo;
    };

    $scope.search = function(params) {
      $scope.$evalAsync(function() {
        $state.go('reports', searchParams(params), { reload: true });
      });
    };

    var searchParams = function(newParams) {
      var params = $scope.searchParams;
      params.page = 1;
      for (var key in newParams) {
        params[key] = newParams[key];
      }
      return params;
    };

    var paginate = function(items) {
      var page = $scope.pagination.page,
        perPage = $scope.pagination.perPage,
        total = $scope.pagination.total,
        start = (page - 1) * perPage,
        end = (page * perPage) - 1;

      $scope.pagination.start = Math.min(start + 1, total);
      $scope.pagination.end = Math.min(end + 1, total);

      if ($scope.searchParams.keywords) {
        $scope.pagination.visibleTotal = items.length;
        return items.slice(start, end);
      } else {
        return items;
      }
    }

    $scope.handleNewReports = function(reports) {
      var uniqueReports = removeDuplicates(reports);
      $scope.pagination.total += uniqueReports.length;
      $scope.pagination.visibleTotal += uniqueReports.length;
      if ($scope.searchParams.keywords) {
        $scope.pagination.visibleTotal = Math.min($scope.pagination.visibleTotal, 100)
      }
      $scope.newReports.addMany(uniqueReports);
    };

    $scope.updateReportStatus = function(updatedReport) {
      if (!(updatedReport._id in $scope.reportsById)) { return }
      $scope.reportsById[updatedReport._id].status = updatedReport.status;
    };

    $scope.displayNewReports = function() {
      var reports = $scope.newReports.toArray();
      $scope.reports.concat(reports);
      $scope.visibleReports.addMany(reports);
      $scope.newReports = new Queue(paginationOptions.perPage);
    };

    $scope.clearSearch = function() {
      $scope.search({ page: null, keywords: null });
    };

    $scope.isFirstPage = function() {
      return $scope.pagination.page == 1;
    };

    $scope.isLastPage = function() {
      return $scope.pagination.end >= $scope.pagination.visibleTotal;
    };

    $scope.nextPage = function() {
      if (!$scope.isLastPage()) {
        $scope.search($scope.currentPage + 1);
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
      });
    };

    $scope.viewReport = function(event, report) {
      if (angular.element(event.target)[0].tagName == 'TD') {
        $state.go('report', { id: report._id });
      }
    };

    $scope.sourceClass = function(report) {
      var source = $scope.sourcesById[report._source];
      if (source && $scope.sourceTypes[source.type] !== -1) {
        return source.type + '-source';
      } else {
        return 'unknown-source';
      }
    };

    (fireDigestEveryThirtySeconds = function() {
      $timeout(fireDigestEveryThirtySeconds, 30 * 1000);
    })();

    init();
  }
]);
