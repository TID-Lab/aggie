angular.module('Aggie')

.controller('IncidentsShowController', [
  '$rootScope',
  '$scope',
  '$state',
  '$stateParams',
  'incident',
  'reports',
  'sources',
  'sourceTypes',
  'Queue',
  'paginationOptions',
  'incidentStatusOptions',
  'veracityOptions',
  'Incident',
  'FlashService',
  'Report',
  function($rootScope, $scope, $state, $stateParams, incident, reports, sources, sourceTypes, Queue, paginationOptions, incidentStatusOptions, veracityOptions, Incident, flash, Report) {
    $scope.incident = incident;
    $scope.reports = reports.results;
    $scope.statusOptions = incidentStatusOptions;
    $scope.veracityOptions = veracityOptions;
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
      if (source && $scope.sourceTypes[source.media] !== -1) {
        return source.media + '-source';
      } else {
        return 'unknown-source';
      }
    };

    $scope.delete = function() {
      Incident.delete({id: $scope.incident._id}, function(){
        flash.setNotice('Incident was successfully deleted.');
         $rootScope.$state.go('incidents');
      }, function() {
        flash.setAlertNow('Incident failed to be deleted.');
      });
    };

    $scope.saveReport = function(report) {
      Report.save({ id: report._id }, report, function() {
      }, function() {
        flash.setAlertNow("Sorry, but that report couldn't be saved for some reason");
      });
    };

    $scope.unlinkReport = function(report) {
      report._incident = null;
      $scope.saveReport(report);
      flash.setNotice('notice.report.unlinked');
      $state.go('incident', { id: $scope.incident._id }, { reload: true });
    };

    init();
  }
]);
