angular.module('Aggie')

.controller('IncidentsShowController', [
  '$rootScope',
  '$scope',
  '$stateParams',
  'incident',
  'reports',
  'sources',
  'sourceTypes',
  'Queue',
  'paginationOptions',
  function($rootScope, $scope, $stateParams, incident, reports, sources, sourceTypes, Queue, paginationOptions) {
    $scope.incident = incident;
    $scope.reports = reports.results;
    $scope.sources = sources;
    $scope.sourcesById = {};
    $scope.sourceTypes = sourceTypes;
    $scope.visibleReports = new Queue(paginationOptions.perPage);

    $scope.pagination = {
      page: parseInt($stateParams.page) || 1,
      total: reports.total,
      visibleTotal: reports.total,
      perPage: paginationOptions.perPage,
      start: 0,
      end: 0
    };

    var groupById = function(memo, item) {
      memo[item._id] = item;
      return memo;
    };

    var init = function() {
      var visibleReports = paginate($scope.reports);
      $scope.visibleReports.addMany(visibleReports);
      $scope.sourcesById = $scope.sources.reduce(groupById, {});
    };

    var paginate = function(items) {
      var page = $scope.pagination.page,
        perPage = $scope.pagination.perPage,
        total = $scope.pagination.total,
        start = (page - 1) * perPage,
        end = (page * perPage) - 1;

      $scope.pagination.start = Math.min(start + 1, total);
      $scope.pagination.end = Math.min(end + 1, total);

      return items;
    }

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

    $scope.viewReport = function(event, report) {
      if (angular.element(event.target)[0].tagName == 'TD') {
        $rootScope.$state.go('report', { id: report._id });
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

    init();
  }
]);
