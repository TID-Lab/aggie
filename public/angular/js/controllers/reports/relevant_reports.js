angular.module('Aggie')
  .controller('RelevantReportsIndexController', [
    '$state',
    '$scope',
    '$rootScope',
    '$stateParams',
    '$window',
    'FlashService',
    'reports',
    'sources',
    'smtcTags',
    'mediaOptions',
    'incidents',
    'statusOptions',
    'linkedtoIncidentOptions',
    'ctLists',
    'Report',
    'Incident',
    'Batch',
    'Socket',
    'Queue',
    'Tags',
    'paginationOptions',
    'escalatedOptions',
    'veracityOptions',
    '$translate',
    'Settings',
    'StatsCache',
    function($state, $scope, $rootScope, $stateParams, $window, flash, reports, sources, smtcTags,
             mediaOptions, incidents, statusOptions, linkedtoIncidentOptions, ctLists,
             Report, Incident, Batch, Socket, Queue, Tags, paginationOptions, escalatedOptions, veracityOptions,
             $translate, Settings, StatsCache) {

      $scope.smtcTags = smtcTags;
      $scope.smtcTagNames = $scope.smtcTags.map(function(smtcTag) {
        return smtcTag.name;
      });
      $scope.visibleSmtcTags = smtcTags;
      $scope.searchParams = $stateParams;
      $scope.escalatedOptions = escalatedOptions;
      $scope.veracityOptions = veracityOptions;
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
      $scope.listOptions = Array.from(new Set(Object.values(ctLists.crowdtangle_list_account_pairs).flat())).concat(Array.from(new Set(Object.values(ctLists.crowdtangle_saved_searches).map(function(obj) {
        return obj.name;
      }))), ["Saved Search"]);
      $scope.detectHateSpeech = false;
      // The initial values of hateSpeechThreshold. These determine the warning icon that appears next to a report
      $scope.hateSpeechThreshold = {
        "threshold": 1.1, // the max hate speech score is 1 so this makes it unachievable
        "enabled": false,
      };

      function setDetectHateSpeech() {
        Settings.get('detectHateSpeech', function(data) {
          $scope.detectHateSpeech = data.detectHateSpeech;
        }, function(error) {
          console.log(error);
        });
      }

      function setSortingScore() {
        var reports = $scope.visibleReports.toArray();
        for (var i = 0; i < reports.length; i++) {
          var metadata = reports[i].metadata;
          if (!metadata) {
            // Ignore this report, it's probably not from CT.
          } else if (metadata.hateSpeechScore == null) {
            metadata.sortingScore = -1;
          } else {
            metadata.sortingScore = metadata.hateSpeechScore;
          }
        }
      }

      function setHateSpeechThreshold() {
        Settings.get('hateSpeechThreshold', function(data) {
          $scope.hateSpeechThreshold = data.hateSpeechThreshold;
        }, function(error) {
          console.log(error);
        });
      }

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

        if ($scope.currentPath === 'relevant_reports' || $scope.currentPath === 'relevant_reports_batch') {
          Socket.join('reports');
          Socket.on('report:updated', $scope.updateReport.bind($scope));
          $scope.stats = StatsCache.get('stats');
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
        updateTagSearchNames();
        setDetectHateSpeech();
        setHateSpeechThreshold();

        setSortingScore();
      };

      var updateStats = function(stats) {
        StatsCache.put('stats', stats);
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
          $state.go('relevant_reports', params, { reload: true });
        });
      };

      var smtcTagNamesToIds = function(tagNames) {
        // This runs on the start of the page
        // This is here because the autocomplete adds , and breaks the search by searching a blank tag Id
        if (tagNames.length !== 1) {
          tagNames = tagNames.split(',');
          if (tagNames[tagNames.length - 1] === '') { tagNames.pop(); }
        }
        //TODO: This can be done with functional programming (whenever I try it breaks)
        var searchedTagIds = tagNames.map(function(smtcTagName) {
          smtcTagName = smtcTagName.trim();
          var foundId = "";
          $scope.smtcTags.forEach(function(smtcTag){
            // Case doesn't matter
            if (smtcTag.name.toLowerCase() === smtcTagName.toLowerCase()) { foundId = smtcTag._id; }
            else if (smtcTag._id === smtcTagName) { foundId = smtcTag._id; }
          });
          if (foundId === "") return null;
          return foundId;
        });
        searchedTagIds = searchedTagIds.filter(function (el) {
          return el != null;
        });
        return searchedTagIds;
      }

      var updateTagSearchNames = function() {
        var tempTags = $scope.searchParams.tags;
        if (tempTags) {
          if(typeof tempTags=="string"){
            tempTags = [tempTags];
          }
          var tagNames = "";
          tagNames = tempTags.map(function(tagId) {
            if ($scope.smtcTagsById[tagId]) { return $scope.smtcTagsById[tagId].name; }
            else { return tagId; }
          });
          $scope.searchParams = { tags: tagNames.join(', ') };
        }
      }

      var searchParams = function(newParams) {
        var params = $scope.searchParams;
        params.page = 1;
        for (var key in newParams) {
          params[key] = newParams[key];
        }
        if (params.tags) {
          params.tags = smtcTagNamesToIds(params.tags);
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

      var setVeracity = function (items, veracity) {
        return items.map(function(item) {
          item.veracity = veracity;
          return item;
        });
      }

      var toggleEscalated = function(items, escalated) {
        return items.map(function(item) {
          item.escalated = escalated;
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

      $scope.reportHoverIn = function(report) {
        if (!report.hoverOver) {
          report.hoverOver = true;
        }
      };

      $scope.reportHoverOut = function(report) {
        if (report.hoverOver) {
          report.hoverOver = false;
        }
      };

      $scope.displayNewReports = function() {
        // TODO: When attempting to add tags to "new Reports" tags breaks the software. Until this is solved, I'm making this function refresh the page, which solves the issue on its own.
        $window.location.reload();
        /*
        var reports = $scope.newReports.toArray();
        reports.forEach(linkify);
        $scope.reports.concat(reports);
        $scope.visibleReports.addMany(reports);
        $scope.newReports = new Queue(paginationOptions.perPage);*/
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

      $scope.noFilters = function() {
        return $scope.searchParams.before === null &&
          $scope.searchParams.after === null &&
          $scope.searchParams.status === null &&
          $scope.searchParams.media === null &&
          $scope.searchParams.sourceId === null &&
          $scope.searchParams.incidentId === null &&
          $scope.searchParams.author === null &&
          $scope.searchParams.tags === null &&
          $scope.searchParams.list === null &&
          $scope.searchParams.keywords === null &&
          $scope.searchParams.escalated === null &&
          $scope.searchParams.veracity === null;
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
          list: null,
          keywords: null,
          escalated: null,
          veracity: null,
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

      $scope.isRead = function(report) {
        return report.read;
      };

      $scope.isEscalated = function(report) {
        return report.escalated;
      }
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

      $scope.editNotes = function(report) {
        report.editingNotes = true;
      }

      $scope.saveNotes = function(report) {
        report.editingNotes = false;
        $scope.saveReport(report);
      }

      /**
       * Sets a report's veracity property and sets its read property to true
       * @param {Report} report
       */
      $scope.setVeracity = function(report, veracity) {
        report.veracity = veracity;
        $scope.saveReport(report);
      };

      /**
       * Toggles a report's escalated property and sets its read property to true
       * @param {Report} report
       */
      $scope.toggleEscalated = function(report) {
        report.escalated = !report.escalated;
        if (report.escalated) {
          report.read = report.escalated;
        }
        $scope.saveReport(report);
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

      $scope.setSelectedVeracityStatus = function(veracity) {
        var items = $scope.filterSelected($scope.reports);
        if (!items.length) return; // If empty, return
        var ids = getIds(setVeracity(items, veracity)); // Changes the Front-end Values
        Report.updateVeracity({ ids: ids, veracity: veracity }); // Changes the Back-end Values
      };

      /**
       * Takes in a boolean "escalated" value and sets the escalated field on selected reports to that value.
       * @param {boolean} escalated
       */
      $scope.setSelectedEscalatedStatus = function(escalated) {
        var items = $scope.filterSelected($scope.reports);
        if (!items.length) return; // If empty, return
        var ids = getIds(toggleEscalated(items, escalated)); // Changes the Front-end Values
        Report.updateEscalated({ ids: ids, escalated: escalated }); // Changes the Back-end Values
      };

      $scope.toggleSelectedEscalated = function() {
        var items = $scope.filterSelected($scope.reports);
        if (!items.length) return; // If empty, return
        if (items.findIndex(function(item) {
          return !item.escalated;
        }) !== -1) $scope.setSelectedEscalatedStatus(true);
        else $scope.setSelectedEscalatedStatus(false);
      }

      /**
       * Toggles smtcTag to selected reports. When all selected reports have the smtcTag, this function removes the tag
       * from all selected reports. Otherwise this function adds the smtcTag to each selected report.
       * @param {SMTCTag} smtcTag
       */
      $scope.toggleTagOnSelected = function(smtcTag) {
        var items = $scope.filterSelected($scope.reports);
        if (!items.length) return;
        if (items.findIndex(function (item) {
          return item.smtcTags.findIndex(function (tag) {
            return tag === smtcTag._id
          }) === -1;
        }) !== -1) $scope.addTagToSelected(smtcTag);
        else $scope.removeTagFromSelected(smtcTag);
      }

      /**
       * Filters the tag list by the given input
       * @param {*} event the DOM event from the text input
       * @param {*} tags the smtc tags, because apparently we can't just reference $scope.smtcTags directly?
       */
      $scope.filterTags = function(event, tags) {
        $scope.visibleSmtcTags = tags.filter(function(tag) {
          return tag.name.toLowerCase().includes(event.target.value.toLowerCase())
        })
      }

      /**
       * Adds a smtcTag to selected reports.
       * @param {SMTCTag} smtcTag
       */
      $scope.addTagToSelected = function(smtcTag) {
        //TODO: There should be a validation that the tag is not already added to the report
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

      /* Batch Mode Functions - TODO: RELEVANT REPORTS BATCH MODE
      $scope.grabBatch = function() {
        // Before we go to batch, the searched query tag is going to be the name of the tag not the ID.
        // This is because the backend sends us back a objectId and we quickly change it to a smtcTag Name instead.
        // TODO: Make the backend return a smtcTagObject instead then populate just the searchbar with the name.
        var batchSearchParams = {};
        if ($scope.searchParams.tags) {
          if (!$scope.smtcTagsById[$scope.searchParams.tags]) {
            batchSearchParams = $scope.searchParams;
            batchSearchParams.tags = smtcTagNamesToIds($scope.searchParams.tags);
          }
        }
        Batch.checkout(batchSearchParams, function(resource) {
          // no more results found
          if (!resource.results || !resource.results.length) {
            var message = 'No more unread reports found.';

            if ($scope.currentPath === 'batch') {
              flash.setNotice(message);
              $rootScope.$state.go('reports', batchSearchParams);
            } else {
              flash.setNoticeNow(message);
            }
            return;
          }
          Batch.resource = resource;
          $rootScope.$state.go('batch', batchSearchParams, { reload: true });
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
          $scope.grabBatch();
        });
      };

      /**
       * Marks all reports in the batch to read and exits batch mode.
       *
      $scope.markAllReadAndDone = function() {
        if (!$scope.reports) return;
        var ids = getIds($scope.reports);
        Report.toggleRead({ ids: ids, read: true }, function() {
          $rootScope.$state.go('reports', $scope.searchParams, { reload: true });
        });
      };
      */

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

        if (report.metadata && report.metadata.platform === "Facebook") {
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

      var splitInput = function(val) {
        return val.split( /,\s*/ );
      }
      var extractLast = function extractLast(term) {
        return splitInput( term ).pop();
      }

      $scope.onTagSearchInputLoad = function() {
        $( "#tagSearchInput" )
          .autocomplete({
            minLength: 0,
            source: function( request, response ) {
              response( $.ui.autocomplete.filter(
                $scope.smtcTagNames, extractLast( request.term ) ) );
            },
            focus: function() {
              return false;
            },
            select: function( event, ui ) {
              var terms = splitInput( this.value );
              // remove the current input
              terms.pop();
              // add the selected item
              terms.push( ui.item.value );
              // add placeholder to get the comma-and-space at the end
              terms.push( "" );
              this.value = terms.join( ", " );
              return false;
            }
          });
      }

      $scope.$on('$destroy', function() {
        Socket.leave('reports');
        Socket.removeAllListeners('reports');
        Socket.leave('stats');
        Socket.removeAllListeners('stats');
        Socket.leave('tags');
        Socket.removeAllListeners('tags');
      });

      $scope.tagsToString = Tags.tagsToString;
      init();
    }
  ]);
