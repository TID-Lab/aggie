angular.module('Aggie')

.controller('ReportsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'FlashService',
  'reports',
  'sources',
  'mediaOptions',
  'incidents',
  'statusOptions',
  'linkedtoIncidentOptions',
  'Report',
  'Incident',
  'Batch',
  'Socket',
  'Queue',
  'paginationOptions',
  function($state, $scope, $rootScope, $stateParams, flash, reports, sources, mediaOptions,
           incidents, statusOptions, linkedtoIncidentOptions, Report, Incident, Batch, Socket, Queue, paginationOptions) {

    $scope.searchParams = $stateParams;
    $scope.reports = reports.results;
    $scope.reportsById = {};
    $scope.sources = sources;
    $scope.sourcesById = {};
    $scope.incidents = incidents.results;
    $scope.incidentsById = {};
    $scope.visibleReports = new Queue(paginationOptions.perPage);
    $scope.newReports = new Queue(paginationOptions.perPage);
    $scope.mediaOptions = mediaOptions;
    $scope.statusOptions = statusOptions;
    $scope.currentPath = $rootScope.$state.current.name;

    // We add options to search reports with any or none incidents linked
    $scope.incidents.push(linkedtoIncidentOptions[0]);
    $scope.incidents.push(linkedtoIncidentOptions[1]);

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

      if ($scope.currentPath === 'reports' || $scope.currentPath === 'batch') {
        Socket.join('reports');
        Socket.on('report:updated', $scope.updateReport.bind($scope));
        if ($scope.isFirstPage()) {
          Socket.emit('query', searchParams());
          Socket.on('reports', $scope.handleNewReports.bind($scope));
        }
      }

      // make links clickable
      $scope.reports.forEach(linkify);
    };

    var linkify = function(report) {
      report.content = Autolinker.link(report.content);
      return report;
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

    $scope.search = function(newParams) {
      $scope.$evalAsync(function() {

        // Remove empty params.
        var params = searchParams(newParams);
        for (var key in params) {
          if (!params[key]) params[key] = null;
        }
        $state.go('reports', params, { reload: true });
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

    $scope.filterSelected = function(items) {
      return items.reduce(function(memo, item) {
        if (item.selected) memo.push(item);
        return memo;
      }, []);
    }

    var toggleRead = function(items, read) {
      return items.map(function(item) {
        item.read = read;
        return item;
      });
    }

    var toggleFlagged = function(items, flagged) {
      return items.map(function(item) {
        item.flagged = flagged;
        return item;
      });
    }

    var getIds = function(items) {
      return items.map(function(item) {
        return item._id;
      });
    }

    $scope.updateReport = function(report) {
      var foundReport = $scope.visibleReports.find(function (item) {
        return item._id == report._id;
      });

      if (!foundReport) return;

      angular.extend(foundReport, report);
      if (!$scope.incidentsById[report._incident]) {
        Incident.get({ id: report._incident }, function(inc) {
          incidents.results.push(inc);
          $scope.incidentsById[report._incident] = inc;
        });
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

    $scope.unlinkIncident = function(report) {
      report._incident = '';
      Report.update({id: report._id}, report);
    }

    $scope.displayNewReports = function() {
      var reports = $scope.newReports.toArray();
      reports.forEach(linkify);
      $scope.reports.concat(reports);
      $scope.visibleReports.addMany(reports);
      $scope.newReports = new Queue(paginationOptions.perPage);
    };

    $scope.clearSearch = function() {
      $scope.search({ page: null, keywords: null });
    };

    $scope.clearAuthor = function() {
      $scope.search({ author: null });
    };

    $scope.countAndCheck = function(key, value) {
      var total = $scope.reports.reduce(function(total, report) {
        if (report[key] === value) total += 1;
        return total;
      }, 0);

      return total == $scope.reports.length;
    }

    $scope.noFilters = function() {
      return $scope.searchParams.before === null &&
        $scope.searchParams.after === null &&
        $scope.searchParams.status === null &&
        $scope.searchParams.media === null &&
        $scope.searchParams.sourceId === null &&
        $scope.searchParams.incidentId === null &&
        $scope.searchParams.author === null &&
        $scope.searchParams.keywords === null;
    };

    $scope.clearFilters = function() {
      $scope.search({
        before: null,
        after: null,
        status: null,
        sourceId: null,
        media: null,
        incidentId: null,
        author: null,
        keywords: null
      });
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
      }
    };

    $scope.isUnassigned = function(report) {
      return !this.isRelevant(report) && !this.isIrrelevant(report);
    };

    $scope.isFlagged = function(report) {
      return report.flagged;
    };

    $scope.isRead = function(report) {
      return report.read;
    }

    $scope.saveReport = function(report) {
      Report.save({ id: report._id }, report, function() {
      }, function() {
        flash.setAlertNow("Sorry, but that report couldn't be saved for some reason");
      });
    };

    $scope.toggleFlagged = function(report) {
      report.flagged = !report.flagged;

      if (report.flagged) {
        report.read = report.flagged;
      }

      $scope.saveReport(report);
    };

    $scope.toggleSelectedRead = function(read) {
      var items = $scope.filterSelected($scope.reports);
      if (!items.length) return;

      var ids = getIds(toggleRead(items, read));
      Report.toggleRead({ids: ids, read: read });
    };

    $scope.toggleAllRead = function(read) {
      var ids = getIds(toggleRead($scope.reports, read));
      Report.toggleRead({ids: ids, read: read });
    };

    $scope.someSelected = function() {

      return $scope.reports.some(function(report) {
        return (report.selected);
      });
    };

    $scope.toggleSelectedFlagged = function(flagged) {
      var items = $scope.filterSelected($scope.reports);
      if (!items.length) return;

      var ids = getIds(toggleFlagged(items, flagged));

      Report.toggleFlagged({ids: ids, flagged: flagged});
    };

    $scope.grabBatch = function() {
      Batch.checkout({}, function(resource) {
        // no more results found
        if (!resource.results || !resource.results.length) {
          var message = 'No more unread reports found.';

          if ($scope.currentPath == 'batch') {
            flash.setNotice(message);
            $rootScope.$state.go('reports', {});
          } else {
            flash.setNoticeNow(message);
          }

          return;
        }

        Batch.resource = resource;
        $rootScope.$state.go('batch', {}, {reload: true });
      });
    };

    $scope.cancelBatch = function() {
      Batch.cancel({}, function() {
        $rootScope.$state.go('reports', {});
      });
    };

    $scope.markAllReadAndGrabAnother = function() {
      if (!$scope.reports) return;

      var ids = getIds($scope.reports);
      Report.toggleRead({ids: ids, read: true}, function() {
        $scope.grabBatch();
      });
    };

    $scope.markAllReadAndDone = function() {
      if (!$scope.reports) return;

      var ids = getIds($scope.reports);

      Report.toggleRead({ids: ids, read: true}, function() {
        $rootScope.$state.go('reports', {}, { reload: true });
      });
    };

    $scope.viewReport = function(event, report) {
      if (angular.element(event.target)[0].tagName == 'TD') {
        $state.go('report', { id: report._id });
      }
    };

    $scope.sourceClass = function(report) {
      var source = $scope.sourcesById[report._source];
      if (source && $scope.mediaOptions[source.media] !== -1) {
        return source.media + '-source';
      } else {
        return 'unknown-source';
      }
    };

    $scope.$on('$destroy', function() {
      Socket.leave('reports');
      Socket.removeAllListeners('reports');
    });

    init();
  }
]);
