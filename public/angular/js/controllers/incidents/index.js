/**
 * This file provides the controller for the templates/incidents/index.html file. This provides all of the functionality
 * that the incidents index page requires. This controller receives incidents, users, and smtcTags from js/routes.js
 */
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
  function($state, $scope, $rootScope, $stateParams, flash, incidents, users, smtcTags, incidentStatusOptions,
           veracityOptions, escalatedOptions, publicOptions, Incident, Socket, Queue, paginationOptions, Tags,
           StatsCache) {
    // These values define the search parameters and pagination.
    $scope.searchParams = $stateParams;
    $scope.statusOptions = incidentStatusOptions;
    $scope.veracityOptions = veracityOptions;
    $scope.escalatedOptions = escalatedOptions;
    $scope.publicOptions = publicOptions;
    $scope.smtcTagNames = $scope.smtcTags.map(function(smtcTag) {
      return smtcTag.name;
    });
    $scope.pagination = {
      page: parseInt($stateParams.page) || 1,
      total: incidents.total,
      visibleTotal: incidents.total,
      perPage: paginationOptions.perPage,
      start: 0,
      end: 0
    };

    // These values receive the incidents themselves and create queues for incidents created by socket.io
    $scope.incidents = incidents.results;
    // incidentsById is a dictionary where the key is the incident's id and the value is the incident.
    $scope.incidentsById = {};
    $scope.visibleIncidents = new Queue(paginationOptions.perPage);
    $scope.newIncidents = new Queue(paginationOptions.perPage);

    // We also need to get the users and tags that are defined in the platform.
    $scope.users = users;
    $scope.smtcTags = smtcTags;
    $scope.smtcTagsById = {};
    // This value used for the SMTCTag column filter.
    $scope.visibleSmtcTags = smtcTags;

    // These values are used for sorting the table by certain fields.
    $scope.sortByProp = 'idnum';
    $scope.reverseSortBy = false;

    // Instead of seeing your username on the assigned to filter, use "me"
    $rootScope.$watch('currentUser', function(user) {
      if (user) {
        // Add a 'me' option for 'assigned to' filter.
        $scope.users.unshift({ _id: user._id, username: '[Me]' });
      }
    });

    /**
     * init defines all of values that need to be calculated and do not come from services.
     */
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
    };

    /**
     * Returns the Reports on the page that are selected via the checkboxes on the table.
     * @param {[]} items with selected property
     * @returns {[Reports]} Array of selected reports
     */
    var filterSelected = function(items) {
      return items.reduce(function(memo, item) {
        if (item.selected) memo.push(item._id);
        return memo;
      }, []);
    };

    /**
     * This removes any duplicates that may pop up when Socket.io sends in new or changed incidents.
     * EX: Someone edits an incident, socket.io sends the updated incident to this user, instead of adding a new
     * incident to the page, we check if the id matches any currently on the page and update it.
     * @param incidents
     * @returns {*}
     */
    var removeDuplicates = function(incidents) {
      return incidents.reduce(function(memo, incident) {
        if (!(incident._id in $scope.incidentsById)) {
          memo.push(incident);
        }
        return memo;
      }, []);
    };

    /**
     * Returns an array of ids from a respective array of incidents.
     * @param {[Incident]} incidents
     * @returns {*}
     */
    var getIds = function(incidents) {
      return incidents.map(function(incident) {
        if (incident.hasOwnProperty('_id')) return incident._id;
        else console.error("getIds: Incident does not have _id property.");
      });
    };

    /**
     * Used by reduce function to create dict where item._id is the key to the item.
     * @param memo dictionary object
     * @param item dictionary value where item._id is the dictionary value's key
     * @returns {*} the dictionary object with the item added to it
     */
    var groupById = function(memo, item) {
      memo[item._id] = item;
      return memo;
    };

    /**
     * This runs on the start of the page load. This is the function that causes the strange visual artifact where an
     * ID turns into a smtcTag in the searchbar. However, this is a quick fix for a larger issue.
     * @param tagNames string names of smtcTags to search their ids
     * @returns {[smtcTag._id]} array of smtcTag ids that were searched
     */
    var smtcTagNamesToIds = function(tagNames) {
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
    /**
     *
     * @param newParams
     * @returns {$stateParams}
     */
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
        $scope.searchParams.tags = tagNames.join(', ');
      }
    }

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
    /**
     * This function sets what property the incident table should now sort by.
     * @param {Property} prop is the property the incident table should now be sorted by.
     */
    $scope.setSortByProp = function(prop) {
      if ($scope.sortByProp == prop) {
        $scope.reverseSortBy = !$scope.reverseSortBy;
        $scope.sortByProp = prop;
      } else {
        $scope.sortByProp = prop;
        $scope.reverseSortBy = false;
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
     * Adds a smtcTag to selected groups.
     * @param {SMTCTag} smtcTag
     */
    $scope.addTagToSelected = function(smtcTag) {
      //TODO: There should be a validation that the tag is not already added to the report
      var items = filterSelected($scope.incidents);
      if (!items.length) {
        flash.setAlertNow("Please first select a group to add a tag to.");
      }
      else {
        if (!items.length) return;
        var ids = getIds(addSMTCTag(items, smtcTag));
        Incident.addSMTCTag({ids: ids, smtcTag: smtcTag._id});
      }
    };

    /**
     * Removes a smtcTag from selected groups.
     * @param {SMTCTag} smtcTag
     */
    $scope.removeTagFromSelected = function(smtcTag) {
      var items = filterSelected($scope.incidents);
      if (!items.length) {
        flash.setAlertNow("Please first select a group to remove a tag from.");
      }
      else {
        var items = filterSelected($scope.incidents);
        if (!items.length) return;
        var ids = getIds(removeSMTCTag(items, smtcTag));
        Incident.removeSMTCTag({ids: ids, smtcTag: smtcTag._id});
      }
    };

    /**
     * Removes all tags from all selected reports.
     */
    $scope.clearTagsFromSelected = function() {
      var items = filterSelected($scope.incidents);
      if (!items.length) return;
      var ids = getIds(clearSMTCTags(items));
      Incident.clearSMTCTags({ids: ids})
    };

    /**
     * Removes tags from the front-end report object. This would change the $scope.smtcTags array in the report.
     * @param items
     * @param smtcTag
     * @returns {*}
     */
    var removeSMTCTag = function(items, smtcTag) {
      return items.map(function(item) {
        item.smtcTags.splice(item.smtcTags.findIndex(function(tag) {return tag === smtcTag._id}), 1);
        return item;
      })
    }

    /**
     * Adds tags to the front-end report object. This would change the $scope.smtcTags array in the report.
     * @param items
     * @param smtcTag
     * @returns {*}
     */
    var addSMTCTag = function(items, smtcTag) {
      return items.map(function(item) {
        console.log(item);
        if (item.smtcTags.findIndex(function(tag) {return tag === smtcTag._id}) === -1) {
          item.smtcTags.push(smtcTag._id);
        }
        return item;

      });
    }

    /**
     * This would clear the smtcTags array within the front-end incident object.
     * @param {[Incident]} incidents which smtcTags arrays are cleared
     * @returns {[Incident]} incidents with cleared smtcTags
     */
    var clearSMTCTags = function(incidents) {
      return incidents.map(function(incident) {
        incident.smtcTags = [];
        return incident;
      });
    }
    /**
     * Removes a tag from a single incident
     * @param {Incident} incident that tag will be removed from
     * @param {SMTCTag} smtcTag that will be removed from incident
     */
    $scope.removeTagFromIncident = function(incident, smtcTag) {
      if (incident.hasOwnProperty('smtcTags')) {
        incident.smtcTags.splice(incident.smtcTags.findIndex(function(tag) {return tag === smtcTag}), 1);
        Incident.removeSMTCTag({ids: [incident._id], smtcTag: smtcTag});
      } else {
        console.error("removeTagFromIncident: Incident does not have smtcTags property.")
      }
    }

    /**
     * For use with socket.io to update SMTCTags as they are changed by other parties.
     * @param {smtcTag} updatedTag
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

    /**
     * This sends a calls the Incident service delete an incident then refreshes the page once the incident is deleted.
     * The refresh is done here because there is no socket.io service that would update the incidents without refresh.
     * @param incident which will be deleted.
     */
    $scope.delete = function(incident) {
      Incident.delete({ id: incident._id }, function() {
        flash.setNotice('incident.delete.success');
        $rootScope.$state.go('incidents', {}, { reload: true });
      }, function() {
        flash.setAlertNow('incident.delete.error');
      });
    };

    /**
     * This routes to a user's profile page.
     * @param user defines the user's profile page this routes to.
     */
    $scope.viewProfile = function(user) {
      $state.go('profile', { userName: user.username });
    };

    /**
     * This routes to a specific incident's show page.
     * @param incident defines the incident show page this routes to.
     */
    $scope.viewIncident = function(incident) {
      $state.go('incident', { id: incident._id });
    };


    /**
     * Splits value into array.
     * Used by tag autocomplete.
     * @param val
     * @returns {*}
     */
    var splitInput = function(val) {
      return val.split( /,\s*/ );
    }

    /**
     * Removes the last term from an input after splicing the input into an array.
     * Used by autocomplete.
     * @param term
     * @returns {*}
     */
    var extractLast = function extractLast(term) {
      return splitInput( term ).pop();
    }

    /**
     * A residual bit of jquery code because we use angular.js.
     * This creates the tag search autocomplete.
     */
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

    // This function removes the socket.io listeners.
    $scope.$on('$destroy', function() {
      Socket.leave('incidents');
      Socket.removeAllListeners('incidents');
      Socket.leave('incidents');
      Socket.removeAllListeners('stats');
      Socket.leave('tags');
      Socket.removeAllListeners('tags');
    });

    $scope.tagsToString = Tags.tagsToString;
    // We always run init at the end of the file so that all the functions are loaded before it is run.
    init();
  }
]);
