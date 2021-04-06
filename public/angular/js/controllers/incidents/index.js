angular.module('Aggie')

.controller('IncidentsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'FlashService',
  'incidents',
  'users',
  'smtcTags',
  'incidentStatusOptions',
  'veracityOptions',
  'escalatedOptions',
  'publicOptions',
  'Incident',
  'Socket',
  'Queue',
  'paginationOptions',
  'Tags',
  'StatsCache',
  function($state, $scope, $rootScope, $stateParams, flash, incidents, users, smtcTags,
           incidentStatusOptions, veracityOptions, escalatedOptions, publicOptions,
           Incident, Socket, Queue, paginationOptions, Tags, StatsCache) {
    $scope.searchParams = $stateParams;
    $scope.incidents = incidents.results;
    $scope.statusOptions = incidentStatusOptions;
    $scope.veracityOptions = veracityOptions;
    $scope.escalatedOptions = escalatedOptions;
    $scope.publicOptions = publicOptions;
    $scope.smtcTags = smtcTags;
    $scope.smtcTagNames = $scope.smtcTags.map(function(smtcTag) {
      return smtcTag.name;
    });
    $scope.visibleSmtcTags = smtcTags;
    $scope.users = users;

    $scope.sortByProp = 'idnum';
    $scope.reverseSortBy = false;

    $scope.setSortByProp = function(prop) {
      if ($scope.sortByProp == prop) {
        $scope.reverseSortBy = !$scope.reverseSortBy;
        $scope.sortByProp = prop;
      } else {
        $scope.sortByProp = prop;
        $scope.reverseSortBy = false;
      }
    }

    $scope.checkWhichSortByProp = function(prop) {
      if ($scope.sortByProp == prop) {
        return true;
      } else {
        return false;
      }
    }

    $rootScope.$watch('currentUser', function(user) {
      if (user) {
        // Add a 'me' option for 'assigned to' filter.
        $scope.users.unshift({ _id: user._id, username: '[Me]' });
      }
    });

    $scope.incidentsById = {};
    $scope.smtcTagsById = {};
    $scope.visibleIncidents = new Queue(paginationOptions.perPage);
    $scope.newIncidents = new Queue(paginationOptions.perPage);
    $scope.statusOptions = incidentStatusOptions;

    $scope.pagination = {
      page: parseInt($stateParams.page) || 1,
      total: incidents.total,
      visibleTotal: incidents.total,
      perPage: paginationOptions.perPage,
      start: 0,
      end: 0
    };

    var init = function() {
      $scope.incidentsById = $scope.incidents.reduce(groupById, {});
      $scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});
      $scope.sortByProp = 'idnum';
      $scope.reverseSortBy = false;

      var visibleIncidents = paginate($scope.incidents);
      $scope.visibleIncidents.addMany(visibleIncidents);

      if ($scope.isFirstPage()) {
        Socket.emit('incidentQuery', searchParams());
        Socket.on('incidents', $scope.handleNewIncidents);
      }
      $scope.stats = StatsCache.get('stats');
      Socket.on('stats', updateStats);
      Socket.join('stats');
      Socket.join('tags');
      Socket.on('tag:new', $scope.updateSMTCTag.bind($scope));
      Socket.on('tag:removed',$scope.updateSMTCTag.bind($scope));
      updateTagSearchNames();
      // if (!$scope.currentUser) {
      //   Socket.leave('stats');
      //   Socket.removeAllListeners('stats');
      // }
    };

    var filterSelected = function(items) {
      return items.reduce(function(memo, item) {
        if (item.selected) memo.push(item._id);
        return memo;
      }, []);
    };

    $scope.filterSelected = function(items) {
      return items.reduce(function(memo, item) {
        if (item.selected) memo.push(item);
        return memo;
      }, []);
    };
    var removeDuplicates = function(incidents) {
      return incidents.reduce(function(memo, incident) {
        if (!(incident._id in $scope.incidentsById)) {
          memo.push(incident);
        }
        return memo;
      }, []);
    };

    var getIds = function(items) {
      return items.map(function(item) {
        return item._id;
      });
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

        $state.go('incidents', params, { reload: true });
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

    var searchParams = function(newParams) {
      var params = $scope.searchParams;
      params.page = 1;
      for (var key in newParams) {
        params[key] = newParams[key];
      }
      return params;
    };

    var updateStats = function(stats) {
      StatsCache.put('stats', stats);
      $scope.stats = stats;
    };

    var updateTagSearchNames = function() {
      if ($scope.searchParams.tags) {
        var tagNames = "";
        tagNames = $scope.searchParams.tags.map(function(tagId) {
          if ($scope.smtcTagsById[tagId]) { return $scope.smtcTagsById[tagId].name; }
          else { return tagId; }
        });
        $scope.searchParams = { tags: tagNames.join(', ') };
      }
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
      var items = $scope.filterSelected($scope.incidents);
      if (!items.length) return;
      var ids = getIds(addSMTCTag(items, smtcTag));
      Incident.addSMTCTag({ids: ids, smtcTag: smtcTag._id});
    };

    /**
     * Removes a smtcTag from selected reports.
     * @param {SMTCTag} smtcTag
     */
    $scope.removeTagFromSelected = function(smtcTag) {
      var items = $scope.filterSelected($scope.incidents);
      if (!items.length) return;
      var ids = getIds(removeSMTCTag(items, smtcTag));
      Incident.removeSMTCTag({ids: ids, smtcTag: smtcTag._id});
    };

    /**
     * Removes all tags from all selected reports.
     */
    $scope.clearTagsFromSelected = function() {
      var items = $scope.filterSelected($scope.incidents);
      if (!items.length) return;
      var ids = getIds(clearSMTCTags(items));
      Incident.clearSMTCTags({ids: ids})
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
    /**
     * Removes a tag from a single report
     * @param {Report} report
     * @param {SMTCTag} smtcTag
     */
    $scope.removeTagFromIncident = function(incident, smtcTag) {
      incident.smtcTags.splice(incident.smtcTags.findIndex(function(tag) {return tag === smtcTag}), 1);
      Incident.removeSMTCTag({ids: [incident._id], smtcTag: smtcTag});
    }

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

    var paginate = function(items) {
      var page = $scope.pagination.page,
        perPage = $scope.pagination.perPage,
        total = $scope.pagination.total,
        start = (page - 1) * perPage,
        end = (page * perPage) - 1;

      $scope.pagination.start = Math.min(start + 1, total);
      $scope.pagination.end = Math.min(end + 1, total);

      return items;
    };



    $scope.handleNewIncidents = function(incidents) {
      var uniqueIncidents = removeDuplicates(incidents);
      $scope.pagination.total += uniqueIncidents.length;
      $scope.pagination.visibleTotal += uniqueIncidents.length;
      $scope.newIncidents.addMany(uniqueIncidents);
    };

    $scope.displayNewIncidents = function() {
      var incidents = $scope.newIncidents.toArray();
      $scope.incidents.concat(incidents);
      incidents.reduce(groupById, $scope.incidents);
      $scope.visibleIncidents.addMany(incidents);
      $scope.newIncidents = new Queue(paginationOptions.perPage);
    };

    $scope.removeSelected = function() {
      var ids = filterSelected($scope.incidents);
      if (!ids.length) return;

      Incident.removeSelected({ ids: ids }, function() {
        flash.setNotice('incident.deleteMultiple.success');
        $rootScope.$state.go('incidents', {}, { reload: true });
      }, function() {
        flash.setAlertNow('incident.deleteMultiple.error');
      });
    };

    $scope.clearTitle = function() {
      $scope.search({ title: null });
    }
    $scope.clearId = function() {
      $scope.search({ idnum: null });
    }

    $scope.clearTags = function() {
      $scope.search({ tags: null });
    }

    $scope.clearLocationName = function() {
      $scope.search({ locationName: null });
    }

    $scope.clearDateFilterFields = function() {
      $scope.searchParams.after = null; $scope.searchParams.before = null;
    };

    $scope.clearDateFilter = function() {
      $scope.search({ after: null, before: null });
    };

    $scope.noFilters = function() {
      return $scope.searchParams.before === null &&
        $scope.searchParams.after === null &&
        $scope.searchParams.idnum === null &&
        $scope.searchParams.creator === null &&
        $scope.searchParams.title === null &&
        $scope.searchParams.locationName === null &&
        $scope.searchParams.assignedTo === null &&
        $scope.searchParams.status === null &&
        $scope.searchParams.veracity === 'unconfirmed' &&
        $scope.searchParams.tags === null &&
        $scope.searchParams.public === null &&
        $scope.searchParams.escalated === null;
    };

    $scope.clearFilters = function() {
      $scope.search({
        page: null,
        title: null,
        idnum: null,
        creator: null,
        locationName: null,
        assignedTo: null,
        status: null,
        veracity: null,
        tags: null,
        escalated: null,
        public: null,
        before: null,
        after: null,
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

    $scope.isUnassigned = function(incident) {
      return !this.isRelevant(incident) && !this.isIrrelevant(incident);
    };

    $scope.saveIncident = function(incident) {
      Incident.save({ id: incident._id }, incident, function() {
      }, function() {
        flash.setAlertNow('incident.save.error');
      });
    };

    $scope.viewIncident = function(incident) {
      $state.go('incident', { id: incident._id });
    };

    $scope.delete = function(incident) {
      Incident.delete({ id: incident._id }, function() {
        flash.setNotice('incident.delete.success');
        $rootScope.$state.go('incidents', {}, { reload: true });
      }, function() {
        flash.setAlertNow('incident.delete.error');
      });
    };

    $scope.viewProfile = function(user) {
      $state.go('profile', { userName: user.username });
    };

    $scope.$on('$destroy', function() {
      Socket.leave('incidents');
      Socket.removeAllListeners('incidents');
      Socket.leave('incidents');
      Socket.removeAllListeners('stats');
      Socket.leave('tags');
      Socket.removeAllListeners('tags');
    });

    $scope.tagsToString = Tags.tagsToString;

    init();
  }
]);
