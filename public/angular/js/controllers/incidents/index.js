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
  'Queue',
  'paginationOptions',
  'Tags',
  function($state, $scope, $rootScope, $stateParams, flash, incidents, users,
           incidentStatusOptions, veracityOptions, escalatedOptions, publicOptions,
           Incident, Socket, Queue, paginationOptions, Tags) {
    $scope.searchParams = $stateParams;
    $scope.incidents = incidents.results;
    $scope.statusOptions = incidentStatusOptions;
    $scope.veracityOptions = veracityOptions;
    $scope.escalatedOptions = escalatedOptions;
    $scope.publicOptions = publicOptions;

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

      if ($scope.isFirstPage()) {
        Socket.emit('incidentQuery', searchParams());
        Socket.on('incidents', $scope.handleNewIncidents);
      }
    };

    var removeDuplicates = function(incidents) {
      return incidents.reduce(function(memo, incident) {
        if (!(incident._id in $scope.incidentsById)) {
          memo.push(incident);
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

        $state.go('incidents', params, { reload: true });
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

      if ($scope.searchParams.title || $scope.searchParams.location) {
        $scope.pagination.visibleTotal = items.length;
        return items.slice(start, end);
      } else {
        return items;
      }
    };

    var filterSelected = function(items) {
      return items.reduce(function(memo, item) {
        if (item.selected) memo.push(item._id);
        return memo;
      }, []);
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

    $scope.noFilters = function() {
      return $scope.searchParams.title === null &&
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
        public: null
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
      Socket.removeAllListeners('incidents');
    });

    $scope.tagsToString = Tags.tagsToString;

    init();
  }
]);
