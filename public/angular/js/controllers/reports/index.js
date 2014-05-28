angular.module('Aggie')

.controller('ReportsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'FlashService',
  'reports',
  'sources',
  'sourceTypes',
  'Report',
  'Socket',
  'Queue',
  function($state, $scope, $rootScope, $stateParams, flash, reports, sources, sourceTypes, Report, Socket, Queue) {
    $scope.keywords = $stateParams.keywords || '';
    $scope.currentKeywords = $scope.keywords;
    $scope.startDate = $stateParams.after || '';
    $scope.endDate = $stateParams.before || '';
    $scope.sourceType = $stateParams.sourceType || '';
    $scope.status = $stateParams.status || '';
    $scope.reportsArray = reports.results;
    $scope.sources = sources;
    $scope.sourcesById = {};
    $scope.reports = new Queue(25);
    $scope.reportsById = {};
    $scope.newReports = new Queue(25);
    $scope.originalReports = angular.copy($scope.reports);
    $scope.sourceTypes = sourceTypes;

    $scope.pagination = {
      page: parseInt($stateParams.page) || 1,
      total: reports.total,
      visibleTotal: reports.total,
      perPage: 25,
      start: 0,
      end: 0
    };

    var init = function() {
      Socket.emit('query', searchParams(null));
      console.debug('Emitting query', searchParams(null));
      $scope.sourcesById = $scope.sources.reduce(groupById, {});
      var reports = paginate($scope.reportsArray).reverse();
      $scope.reportsById = reports.reduce(groupById, {});
      $scope.reports.addMany(reports);
      Socket.on('reports', $scope.handleNewReports);
    };

    var removeDuplicates = function(reports) {
      var keys = Object.keys($scope.reportsById);
      return reports.filter(function(report) {
        var unique = keys.indexOf(report._id) === -1;
        if (!unique) { console.debug('Ignoring duplicate report with id ' + report._id) }
        return unique;
      });
    };

    var groupById = function(memo, item) {
      memo[item._id] = item;
      return memo;
    };

    var search = function(page) {
      $state.go('reports', searchParams(page), { reload: true });
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

    $scope.handleNewReports = function(reports) {
      console.debug(reports.length + ' new reports received');
      if ($scope.pagination.page > 1) {
        console.debug("Ignoring reports since we're not on the first page");
        return;
      }
      $scope.newReports.addMany(removeDuplicates(reports));
    };

    $scope.displayNewReports = function() {
      $scope.reports.addMany($scope.newReports.elements.reverse());
      $scope.newReports.clear();
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

    $scope.search = function() {
      if (!$scope.keywords.length) { $scope.keywords = null }
      search(null);
    };

    $scope.clearSearch = function() {
      $scope.keywords = null;
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
      var source = $scope.sources[report._source];
      if (source && $scope.sourceTypes[source.type] !== -1) {
        return source.type + '-source';
      } else {
        return 'unknown-source';
      }
    };

    init();
  }
]);
