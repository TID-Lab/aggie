angular.module('Aggie')

.controller('IncidentSelectModalController', [
  '$rootScope',
  '$scope',
  '$location',
  '$modal',
  'Incident',
  'Report',
  'FlashService',
  function($rootScope, $scope, $location, $modal, Incident, Report, flash) {
    $scope.setIncident = function(report) {
      var modalInstance = $modal.open({
        controller: 'IncidentSelectModalInstanceController',
        templateUrl: '/templates/incidents/report_incident_modal.html',
        scope: $scope,
        resolve: {
          incidents: ['Incident', function(Incident) {
            return Incident.query().$promise;
          }],
          report: function() {
            return report;
          }
        }
      });

      modalInstance.result.then(function(report) {
        report.read = true;     
        Report.update({id: report._id}, report, function(response) {
          $scope.$parent.r = report;
        }, function(err) {
          flash.setAlertNow('Report failed to be added to incident.');
        });
      });
    };
  }
])

.controller('IncidentSelectModalInstanceController', [
  '$scope',
  '$modalInstance',
  'incidents',
  'report',
  function($scope, $modalInstance, incidents, report) {
    $scope.incidents = incidents.results;
    $scope.report = angular.copy(report);
    $scope._showErrors = false;

    $scope.showErrors = function() {
      return $scope._showErrors;
    };

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope._showErrors = true;
        return;
      }
      $modalInstance.close($scope.report);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
