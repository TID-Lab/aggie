angular.module('Aggie')

.controller('IncidentSelectModalController', [
  '$rootScope',
  '$scope',
  '$q',
  '$location',
  '$modal',
  '$modalStack',
  'Incident',
  'Report',
  'FlashService',
  function($rootScope, $scope, $q, $location, $modal, $modalStack, Incident, Report, flash) {

    $scope.setIncident = function(reports) {
      $modalStack.dismissAll();
      var modalInstance = $modal.open({
        windowClass: 'report-to-existing',
        size: 'lg',
        controller: 'IncidentSelectModalInstanceController',
        templateUrl: '/templates/incidents/report_incident_modal.html',
        resolve: {
          incidents: ['Incident', function(Incident) {
            return Incident.query().$promise;
          }],
          reports: function() {
            if (!reports) {
              reports = $scope.filterSelected($scope.reports);
            }

            return reports;
          }
        }
      });

      modalInstance.result.then(function(incidentId) {
        var ids = reports.map(function(report) {
          return report._id;
        });

        Report.linkToIncident({ ids: ids, incident: incidentId });
      });
    };
  }
])

.controller('IncidentSelectModalInstanceController', [
  '$rootScope',
  '$scope',
  '$modalInstance',
  'incidents',
  'reports',
  'Tags',
  'Incident',
  'paginationOptions',
  function($rootScope, $scope, $modalInstance, incidents, reports, Tags, Incident, paginationOptions) {
    $scope.reports = angular.copy(reports);
    $scope.incidents = incidents.results;
    $scope.modal = $modalInstance;
    $scope._showErrors = false;

    $scope.select = function(incident) {
      // report._incident = incident._id;
      $modalInstance.close(incident._id);
    };

    $scope.showErrors = function() {
      return $scope._showErrors;
    };

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope._showErrors = true;
        return;
      }

      $modalInstance.close($scope.reports);
    };

    $scope.tagsToString = Tags.tagsToString;

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.pagination = {
      page: 1,
      perPage: paginationOptions.perPage,
      start: 1,
      end: $scope.incidents.length,
      total: incidents.total
    };

    $scope.getPage = function(page) {

      Incident.query({ page: page - 1 }).$promise
        .then(function(incidents) {
          $scope.incidents = incidents.results;
          var perPage = $scope.pagination.perPage;
          var start = (page - 1) * perPage;
          var l = $scope.incidents.length;
          $scope.pagination.start = start + 1;
          $scope.pagination.end = (page - 1) * perPage + l;
          $scope.pagination.page = page;

        });
    };

    $scope.isFirstPage = function() {
      return $scope.pagination.page === 1;
    };

    $scope.isLastPage = function() {
      return $scope.pagination.end === incidents.total;
    };
  }
]);
