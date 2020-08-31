angular.module('Aggie')
.controller('ReportsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'FlashService',
  'reports',
  'sources',
  'smtcTags',
  'mediaOptions',
  'incidents',
  'statusOptions',
  'linkedtoIncidentOptions',
  'Report',
  'Incident',
  'Batch',
  'Socket',
  'Queue',
  'Tags',
  'paginationOptions',
  '$translate',
  function($state, $scope, $rootScope, $stateParams, flash, reports, sources, smtcTags,
           mediaOptions, incidents, statusOptions, linkedtoIncidentOptions,
           Report, Incident, Batch, Socket, Queue, Tags, paginationOptions,
           $translate) {

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
    $scope.smtcTags = smtcTags;

    // We add options to search reports with any or none incidents linked
    linkedtoIncidentOptions[0].title = $translate.instant(linkedtoIncidentOptions[0].title);
    linkedtoIncidentOptions[1].title = $translate.instant(linkedtoIncidentOptions[1].title);
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
      $scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});

      var visibleReports = paginate($scope.reports);
      $scope.visibleReports.addMany(visibleReports);

      if ($scope.currentPath === 'reports' || $scope.currentPath === 'batch') {
        Socket.join('reports');
        Socket.on('report:updated', $scope.updateReport.bind($scope));
        Socket.on('stats', updateStats);
        Socket.join('stats');
        Socket.join('tags');
        Socket.on('tag:new', $scope.updateSMTCTag.bind($scope));
        Socket.on('tag:removed',$scope.updateSMTCTag.bind($scope));
        if ($scope.isFirstPage()) {
          Socket.emit('query', searchParams());
          Socket.on('reports', $scope.handleNewReports.bind($scope));
        }
      }
      // make links clickable
      $scope.reports.forEach(linkify);
    };

    var updateStats = function(stats) {
      $scope.stats = stats;
    };

    var linkify = function(report) {
      if (report.content !== null) {
        report.content = Autolinker.link(report.content);
      }
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
        end = page * perPage - 1;

      $scope.pagination.start = Math.min(start + 1, total);
      $scope.pagination.end = Math.min(end + 1, total);

      return items;
    };

    $scope.filterSelected = function(items) {
      return items.reduce(function(memo, item) {
        if (item.selected) memo.push(item);
        return memo;
      }, []);
    };


    var toggleRead = function(items, read) {
      return items.map(function(item) {
        item.read = read;
        return item;
      });
    };

    var toggleFlagged = function(items, flagged) {
      return items.map(function(item) {
        item.flagged = flagged;
        return item;
      });
    };

    var removeSMTCTag = function(items, smtcTag) {
      return items.map(function(item) {
        item.smtcTags.splice(item.smtcTags.findIndex(function(tag) {return tag === smtcTag._id}), 1);
        return item;
      })
    }
    var addSMTCTag = function(items, smtcTag) {
      return items.map(function(item) {
        if (item.smtcTags.findIndex(function(tag) {return tag === smtcTag._id}) === -1) {
          item.smtcTags.push(smtcTag);
        }
        return item;
      });
    }

    var clearSMTCTags = function(items) {
      return items.map(function(item) {
        item.smtcTags = [];
        return item;
      });
    }

    var getIds = function(items) {
      return items.map(function(item) {
        return item._id;
      });
    };

    /**
     * For use with socket.io. This function updates report when their properties are changed by another user.
     * @param {!Report} report
     */
    $scope.updateReport = function(report) {
      var foundReport = $scope.visibleReports.find(function(item) {
        return item._id === report._id;
      });
      if (!foundReport) return;
      angular.extend(foundReport, report);
      if (!$scope.incidentsById[report._incident]) {
        Incident.get({ id: report._incident }, function(inc) {
          incidents.results.push(inc);
          $scope.incidentsById[report._incident] = inc;
        });
      }
    };

    /**
     * For use with socket.io to update SMTCTags as they are changed by other parties.
     * @param {!smtcTag} updatedTag
     */
    $scope.updateSMTCTag = function (updatedTag) {
      // remove deleted tag
      if (updatedTag.name == null) {
        var delIndex = $scope.smtcTags.map(function(item) {
          return item._id
        }).indexOf(updatedTag);
        $scope.smtcTags.splice(delIndex, 1);
      } else {
        // add new tag
        $scope.smtcTags.push(updatedTag);
      }
    }

    $scope.handleNewReports = function(reports) {
      var uniqueReports = removeDuplicates(reports);
      $scope.pagination.total += uniqueReports.length;
      $scope.pagination.visibleTotal += uniqueReports.length;
      $scope.newReports.addMany(uniqueReports);
    };

    $scope.unlinkIncident = function(report) {
      report._incident = '';
      Report.update({ id: report._id }, report);
    };

    $scope.displayNewReports = function() {
      var reports = $scope.newReports.toArray();
      reports.forEach(linkify);
      $scope.reports.concat(reports);
      $scope.visibleReports.addMany(reports);
      $scope.newReports = new Queue(paginationOptions.perPage);
    };

    $scope.clearDateFilterFields = function() {
      $scope.searchParams.after = null; $scope.searchParams.before = null;
    };

    $scope.clearSearch = function() {
      $scope.search({ page: null, keywords: null });
    };

    $scope.clearAuthor = function() {
      $scope.search({ author: null });
    };

    $scope.clearTags = function() {
      $scope.search({ tags: null });
    };

    $scope.clearDateFilter = function() {
      $scope.search({ after: null, before: null });
    };

    $scope.countAndCheck = function(key, value) {
      var total = $scope.reports.reduce(function(total, report) {
        if (report[key] === value) total += 1;
        return total;
      }, 0);

      return total === $scope.reports.length;
    };

    $scope.noFilters = function() {
      return $scope.searchParams.before === null &&
        $scope.searchParams.after === null &&
        $scope.searchParams.status === null &&
        $scope.searchParams.media === null &&
        $scope.searchParams.sourceId === null &&
        $scope.searchParams.incidentId === null &&
        $scope.searchParams.author === null &&
        $scope.searchParams.tags === null &&
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
        tags: null,
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
    };

    /**
     * Saves a front-end report to the back end.
     * @param {Report} report
     */
    $scope.saveReport = function(report) {
      Report.save({ id: report._id }, report, function() {
      }, function() {
        flash.setAlertNow("Sorry, but that report couldn't be saved.");
      });
    };

    /**
     * Toggles a report's flagged property and sets its read property to true
     * @param {Report} report
     */
    $scope.toggleFlagged = function(report) {
      report.flagged = !report.flagged;
      if (report.flagged) {
        report.read = report.flagged;
      }
      $scope.saveReport(report);
    };

    /**
     * Sets selected reports' read property to read value
     * @param {boolean} read
     */
    $scope.toggleSelectedRead = function(read) {
      var items = $scope.filterSelected($scope.reports);
      if (!items.length) return;

      var ids = getIds(toggleRead(items, read));
      Report.toggleRead({ ids: ids, read: read });
    };

    /**
     * Sets all reports' read property in the scope to read
     * @param {boolean} read
     */
    $scope.toggleAllRead = function(read) {
      var ids = getIds(toggleRead($scope.reports, read));
      Report.toggleRead({ ids: ids, read: read });
    };

    /**
     * Returned value is meant to be used as a boolean to check if any reports are selected.
     * @returns {boolean}
     */
    $scope.someSelected = function() {
      return $scope.reports.some(function(report) {
        return report.selected;
      });
    };

    /**
     * Takes in a boolean "flagged" value and sets the flagged field on selected reports to that value.
     * @param {boolean} flagged
     */
    $scope.toggleSelectedFlagged = function(flagged) {
      var items = $scope.filterSelected($scope.reports);
      if (!items.length) return; // If empty, return
      var ids = getIds(toggleFlagged(items, flagged)); // Changes the Front-end Values
      Report.toggleFlagged({ ids: ids, flagged: flagged }); // Changes the Back-end Values
    };



    /**
     * Toggles smtcTag to selected reports. When all selected reports have the smtcTag, this function removes the tag
     * from all selected reports. Otherwise this function adds the smtcTag to each selected report.
     * @param {SMTCTag} smtcTag
     */
    $scope.toggleTagOnSelected = function(smtcTag) {
      var items = $scope.filterSelected($scope.reports);
      if (!items.length) return;
      if (items.findIndex(function(item) {
        return item.smtcTags.findIndex(function(tag) {return tag === smtcTag._id}) === -1;
      }) !== -1) $scope.addTagToSelected(smtcTag);
      else $scope.removeTagFromSelected(smtcTag);
    }

    /**
     * Adds a smtcTag to selected reports.
     * @param {SMTCTag} smtcTag
     */
    $scope.addTagToSelected = function(smtcTag) {
      var items = $scope.filterSelected($scope.reports);
      if (!items.length) return;
      var ids = getIds(addSMTCTag(items, smtcTag));
      Report.addSMTCTag({ids: ids, smtcTag: smtcTag._id});
    };

    /**
     * Removes a smtcTag from selected reports.
     * @param {SMTCTag} smtcTag
     */
    $scope.removeTagFromSelected = function(smtcTag) {
      var items = $scope.filterSelected($scope.reports);
      if (!items.length) return;
      var ids = getIds(removeSMTCTag(items, smtcTag));
      Report.removeSMTCTag({ids: ids, smtcTag: smtcTag._id});
    };

    /**
     * Removes all tags from all selected reports.
     */
    $scope.clearTagsFromSelected = function() {
      var items = $scope.filterSelected($scope.reports);
      if (!items.length) return;

      var ids = getIds(clearSMTCTags(items));
      Report.clearSMTCTags({ids: ids})
    };

    /**
     * Removes a tag from a single report
     * @param {Report} report
     * @param {SMTCTag} smtcTag
     */
    $scope.removeTagFromReport = function(report, smtcTag) {
      report.smtcTags.splice(report.smtcTags.findIndex(function(tag) {return tag === smtcTag}), 1);
      Report.removeSMTCTag({ids: [report._id], smtcTag: smtcTag});
    }

    // Batch Mode Functions
    $scope.grabBatch = function() {
      $scope.searchParams.tags = Tags.stringToTags($scope.searchParams.tags);
      Batch.checkout($scope.searchParams, function(resource) {
        // no more results found
        if (!resource.results || !resource.results.length) {
          var message = 'No more unread reports found.';

          if ($scope.currentPath === 'batch') {
            flash.setNotice(message);
            $rootScope.$state.go('reports', $scope.searchParams);
          } else {
            flash.setNoticeNow(message);
          }

          return;
        }

        Batch.resource = resource;
        $rootScope.$state.go('batch', $scope.searchParams, { reload: true });
      });
    };

    $scope.cancelBatch = function() {
      Batch.cancel({}, function() {
        $rootScope.$state.go('reports', $scope.searchParams);
      });
    };

    $scope.markAllReadAndGrabAnother = function() {
      if (!$scope.reports) return;

      var ids = getIds($scope.reports);
      Report.toggleRead({ ids: ids, read: true }, function() {
        $scope.grabBatch();
      });
    };

    /**
     * Marks all reports in the batch to read and exits batch mode.
     */
    $scope.markAllReadAndDone = function() {
      if (!$scope.reports) return;
      var ids = getIds($scope.reports);
      Report.toggleRead({ ids: ids, read: true }, function() {
        $rootScope.$state.go('reports', $scope.searchParams, { reload: true });
      });
    };

    /**
     * Goes to the show page for a report.
     * @param event
     * @param {!Report} report
     */
    $scope.viewReport = function(event, report) {
      if (angular.element(event.target)[0].tagName === 'TD') {
        $state.go('report', { id: report._id });
      }
    };

    // CSS functions
    $scope.sourceClass = function(report) {
      // Pick one of the sources that has a media type. For now, it happens that
      // if a report has multiple sources, they all have the same type, or are
      // deleted

      if (report.metadata.platform === "Facebook") {
        // set Facebook as source for CrowdTangle reports
          return 'facebook-source';
      } else {
        for (var i = 0; i < report._sources.length; i++) {
          var sourceId = report._sources[i];
          var source = $scope.sourcesById[sourceId];
          if (source && $scope.mediaOptions[source.media] !== -1) {
            return source.media + '-source';
          }
        }
        return 'unknown-source';
      }
    };

    $scope.$on('$destroy', function() {
      Socket.leave('reports');
      Socket.removeAllListeners('reports');
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });

    $scope.tagsToString = Tags.tagsToString;
    init();
  }
]);
