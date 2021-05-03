angular.module('Aggie')
    .controller('ReportsShowController', [
      '$rootScope',
      '$state',
      '$scope',
      '$stateParams',
      '$window',
      'mediaOptions',
      'FlashService',
      'data',
      'incidents',
      'Report',
      'Incident',
      'incidents',
      'Tags',
      'smtcTags',
      'comments',
      'Socket',
      'Queue',
      'sources',
      'paginationOptions',
      '$translate',
      'StatsCache',
      function($rootScope, $state, $scope, $stateParams, $window, mediaOptions, flash, data, incidents, Report, Incident,
               incidents, Tags, smtcTags, comments, Socket, Queue, sources, paginationOptions,  $translate, StatsCache) {
        $scope.incidents = incidents.results;
        $scope.incidentsById = {};
        $scope.currentPath = $rootScope.$state.current.name;
        $scope.smtcTags = smtcTags;
        $scope.smtcTagsById = {};
        $scope.reports = comments.results; //Comments are just special reports
        $scope.visibleReports = new Queue(paginationOptions.perPage);
        $scope.newReports = new Queue(paginationOptions.perPage);
        $scope.sources = sources;
        $scope.sourcesById = {};
        $scope.pagination = {
          page: parseInt($stateParams.page) || 1,
          total: comments.total || 0,
          visibleTotal: comments.total || 0,
          perPage: paginationOptions.perPage,
          start: 0,
          end: 0
        };
        $scope.report = data.report;
        $scope.sources = data.sources;

        var init = function() {
          if ($scope.reports) {
            $scope.reportsById = $scope.reports.reduce(groupById, {});
            var visibleReports = paginate($scope.reports);
            $scope.visibleReports.addMany(visibleReports);
            $scope.reports.forEach(linkify);
          }
          $scope.sourcesById = $scope.sources.reduce(groupById, {});
          $scope.incidentsById = $scope.incidents.reduce(groupById, {});
          $scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});
          if ($scope.currentPath === 'report') {
            Socket.join('reports');
            Socket.on('report:updated', $scope.updateReport.bind($scope));
            Socket.join('stats');
            $scope.stats = StatsCache.get('stats');
            Socket.on('stats', updateStats);
            if ($scope.isFirstPage()) {
              Socket.on('reports', $scope.handleNewReports.bind($scope));
            }
          }
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

        $scope.editNotes = function(report) {
          report.editingNotes = true;
        }

        $scope.saveNotes = function(report) {
          report.editingNotes = false;
          $scope.saveReport(report);
        }

        $scope.unlinkIncident = function() {
          $scope.report._incident = '';
          Report.update({ id: $scope.report._id }, $scope.report);
        };

        $scope.unlinkCommentIncident = function(report) {
          report._incident = '';
          Report.update({ id: report._id }, report);
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
            console.error("Report could not be saved.")
          });
        };




        $scope.markAsRead = function (report) {
          if (report.read) return;
          report.read = true;
          Report.save({id: report._id}, report);
        };

        $scope.tagsToString = Tags.tagsToString;
        $scope.markAsRead(data.report);



        $scope.isFirstPage = function() {
          return $scope.pagination.page == 1;
        };

        $scope.isLastPage = function() {
          return $scope.pagination.end >= $scope.pagination.visibleTotal;
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
         * Sets selected reports' read property to read value
         * @param {boolean} read
         */
        $scope.setSelectedReadStatus = function(read) {
          var items = $scope.filterSelected($scope.reports);
          if (!items.length) return;
          var ids = getIds(toggleRead(items, read));
          Report.toggleRead({ ids: ids, read: read });
        };

        $scope.toggleSelectedRead = function() {
          var items = $scope.filterSelected($scope.reports);
          if (!items.length) return; // If empty, return
          if (items.findIndex(function(item) {
            return !item.read;
          }) !== -1) $scope.setSelectedReadStatus(true);
          else $scope.setSelectedReadStatus(false);
        }

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

        $scope.$back = function() {
          $window.history.back();
        };

        $scope.$on('$destroy', function() {
          Socket.leave('reports');
          Socket.removeAllListeners('reports');
          Socket.leave('stats');
          Socket.removeAllListeners('stats');
        });

        init();
      }
    ]);

// This module is for trusting crowdtangle media content so it can be displayed
// Unless crowdtangle's api returns a url for something that is untrustworthy, this shouldn't post a security risk
angular.module('Aggie')

    .filter('trusted', ['$sce', function ($sce) {
      return function(url) {
        return $sce.trustAsResourceUrl(url);
      };
    }]);
