angular.module('Aggie')

.controller('IncidentsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  '$timeout',
  '$stateParams',
  'FlashService',
  'incidents',
  'users',
  'incidentStatusOptions',
  'veracityOptions',
  'Incident',
  'Socket',
  'Queue',
  'paginationOptions',
  function($state, $scope, $rootScope, $timeout, $stateParams, flash, incidents, users, incidentStatusOptions, veracityOptions, Incident, Socket, Queue, paginationOptions) {
    $scope.searchParams = $stateParams;
    $scope.incidents = incidents.results;
    $scope.statusOptions = incidentStatusOptions;
    $scope.veracityOptions = veracityOptions;

    $scope.users = users.map(function(u) {
      return {
        value: u.username,
        label: u.username
      };
    });

    $rootScope.$watch('currentUser', function(user) {
      if (!user) { return; }
      $scope.users.unshift({
        label: 'Assigned to me',
        value: user.username
      });
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

    $scope.search = function(params) {
      $scope.$evalAsync(function() {
        $state.go('incidents', searchParams(params), { reload: true });
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
    }

    $scope.handleNewIncidents = function(incidents) {
      var uniqueIncidents = removeDuplicates(incidents);
      $scope.pagination.total += uniqueIncidents.length;
      $scope.pagination.visibleTotal += uniqueIncidents.length;
      $scope.pagination.visibleTotal = Math.min($scope.pagination.visibleTotal, 100);
      $scope.newIncidents.addMany(uniqueIncidents);
    };

    $scope.displayNewIncidents = function() {
      var incidents = $scope.newIncidents.toArray();
      $scope.incidents.concat(incidents);
      incidents.reduce(groupById, $scope.incidents);
      $scope.visibleIncidents.addMany(incidents);
      $scope.newIncidents = new Queue(paginationOptions.perPage);
    };

    $scope.clearSearch = function() {
      $scope.search({ page: null, title: null, locationName: null});
    };

    $scope.isFirstPage = function() {
      return $scope.pagination.page === 1;
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

    $scope.isRelevant = function(incident) {
      return incident.status === 'relevant';
    };

    $scope.isIrrelevant = function(incident) {
      return incident.status === 'irrelevant';
    };

    $scope.isUnassigned = function(incident) {
      return !this.isRelevant(incident) && !this.isIrrelevant(incident);
    };

    $scope.saveIncident = function(incident) {
      Incident.save({ id: incident._id }, incident, function() {
      }, function() {
        flash.setAlertNow("Sorry, but that incident couldn't be saved for some reason");
      });
    };

    $scope.viewIncident = function(event, incident) {
      if (angular.element(event.target)[0].tagName === 'TD') {
        $state.go('incident', { id: incident._id });
      }
    };

    $scope.incidentClass = function(incident) {
      return incident.status + '-incident';
    };

    $scope.delete = function(incident) {
      Incident.delete({id: incident._id}, function(){
        flash.setNotice('Incident was successfully deleted.');
        $rootScope.$state.go('incidents', {}, { reload: true });
      }, function() {
        flash.setAlertNow('Incident failed to be deleted.');
      });
    };

    $scope.filterRoleFirstLetter = function(incident) {
      return users.filter(function(user) {
        return user.username === incident.assignedTo;
      })[0].role.charAt(0).toUpperCase();
    };

    (fireDigestEveryThirtySeconds = function() {
      $timeout(fireDigestEveryThirtySeconds, 30 * 1000);
    })();

    init();
  }
]);
