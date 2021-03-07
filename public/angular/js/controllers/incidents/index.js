angular.module('Aggie')

.controller('IncidentsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'FlashService',
  'incidents',
  'users',
  'incidentStatusOptions',
  'veracityOptions',
  'escalatedOptions',
  'publicOptions',
  'Incident',
  'Socket',
  'Tags',
  'smtcTags',
  'Queue',
  'paginationOptions',

  function($state, $scope, $rootScope, $stateParams, flash, incidents, users,
           incidentStatusOptions, veracityOptions, escalatedOptions, publicOptions,
           Incident, Socket, Queue, paginationOptions, Tags, smtcTags) {
    $scope.smtcTags = smtcTags;
    $scope.smtcTagNames = $scope.smtcTags.map(function(smtcTag) {
      return smtcTag.name;
    });
    $scope.visibleSmtcTags = smtcTags;
    $scope.searchParams = $stateParams;
    $scope.incidents = incidents.results;
    $scope.statusOptions = incidentStatusOptions;
    $scope.veracityOptions = veracityOptions;
    $scope.escalatedOptions = escalatedOptions;
    $scope.publicOptions = publicOptions;
    $scope.smtcTags = smtcTags;
    $scope.users = users;

    $rootScope.$watch('currentUser', function(user) {
      if (user) {
        // Add a 'me' option for 'assigned to' filter.
        $scope.users.unshift({ _id: user._id, username: '[Me]' });
      }
    });

    $scope.incidentsById = {};
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

      var visibleIncidents = paginate($scope.incidents);
      $scope.visibleIncidents.addMany(visibleIncidents);
      $scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});

      if ($scope.isFirstPage()) {
        Socket.emit('incidentQuery', searchParams());
        Socket.on('incidents', $scope.handleNewIncidents);
      }
      Socket.on('stats', updateStats);
      Socket.join('stats');
      // if (!$scope.currentUser) {
      //   Socket.leave('stats');
      //   Socket.removeAllListeners('stats');
      // }
    };

    var removeDuplicates = function(incidents) {
      return incidents.reduce(function(memo, incident) {
        if (!(incident._id in $scope.incidentsById)) {
          memo.push(incident);
        }
        return memo;
      }, []);
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

    var updateStats = function(stats) {
      $scope.stats = stats;
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
    };

    var filterSelected = function(items) {
      return items.reduce(function(memo, item) {
        if (item.selected) memo.push(item._id);
        return memo;
      }, []);
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
    $scope.toggleTagOnSelected = function(smtcTag) {
      var items = $scope.filterSelected($scope.incidents);
      if (!items.length) return;
      if (items.findIndex(function(item) {
        return item.smtcTags.findIndex(function(tag) {return tag === smtcTag._id}) === -1;
      }) !== -1) $scope.addTagToSelected(smtcTag);
      else $scope.removeTagFromSelected(smtcTag);
    }

    $scope.filterTags = function(event, tags) {
      $scope.visibleSmtcTags = tags.filter(function(tag) {
        return tag.name.toLowerCase().includes(event.target.value.toLowerCase())
      })
    }

    $scope.addTagToSelected = function(smtcTag) {
      var items = $scope.filterSelected($scope.incidents);
      if (!items.length) return;
      var ids = getIds(addSMTCTag(items, smtcTag));
      Incident.addSMTCTag({ids: ids, smtcTag: smtcTag._id});
    };

    $scope.removeTagFromSelected = function(smtcTag) {
      var items = $scope.filterSelected($scope.incidents);
      if (!items.length) return;
      var ids = getIds(removeSMTCTag(items, smtcTag));
      Incident.removeSMTCTag({ids: ids, smtcTag: smtcTag._id});
    };

    $scope.clearTagsFromSelected = function() {
      var items = $scope.filterSelected($scope.incidents);
      if (!items.length) return;

      var ids = getIds(clearSMTCTags(items));
      Incident.clearSMTCTags({ids: ids})
    };

    $scope.removeTagFromIncident = function(incident, smtcTag) {
      incident.smtcTags.splice(incident.smtcTags.findIndex(function(tag) {return tag === smtcTag}), 1);
      Incident.removeSMTCTag({ids: [incident._id], smtcTag: smtcTag});
    }


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
        $scope.searchParams.title === null &&
        $scope.searchParams.locationName === null &&
        $scope.searchParams.assignedTo === null &&
        $scope.searchParams.status === null &&
        $scope.searchParams.veracity === null &&
        $scope.searchParams.tags === null &&
        $scope.searchParams.public === null &&
        $scope.searchParams.escalated === null;
    };

    $scope.clearFilters = function() {
      $scope.search({
        page: null,
        title: null,
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
    $scope.removeTagFromIncident = function(incident, smtcTag) {
      incident.smtcTags.splice(incident.smtcTags.findIndex(function(tag) {return tag === smtcTag}), 1);
      Incident.removeSMTCTag({ids: [incident._id], smtcTag: smtcTag});
    }
    $scope.viewProfile = function(user) {
      $state.go('profile', { userName: user.username });
    };
    

    $scope.$on('$destroy', function() {
      Socket.leave('incidents');
      Socket.removeAllListeners('incidents');
      Socket.leave('incidents');
      Socket.removeAllListeners('stats');
    });

    $scope.tagsToString = Tags.tagsToString;

    init();
  }
]);
