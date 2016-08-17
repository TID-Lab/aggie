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

        Report.linkToIncident({ids: ids, incident: incidentId});
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
  function($rootScope, $scope, $modalInstance, incidents, reports) {
    $scope.reports = angular.copy(reports);
    $scope.incidents = incidents.results;
    $scope.modal = $modalInstance;
    $scope._showErrors = false;

    $scope.select = function(incident) {
      //report._incident = incident._id;
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

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

  }
]);
