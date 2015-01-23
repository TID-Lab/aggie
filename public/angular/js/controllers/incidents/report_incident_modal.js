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
        windowClass: 'report-to-existing',
        size: 'lg',
        controller: 'IncidentSelectModalInstanceController',
        templateUrl: 'templates/incidents/report_incident_modal.html',
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
        Report.update({id: report._id}, report, function(response) {
          flash.setNotice('Report was successfully added to incident.');
          $rootScope.$state.go('reports', {}, { reload: true });
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
    var report = angular.copy(report);
    $scope.incidents = incidents.results;
    $scope.select = function (incident) {
      report._incident = incident._id;
      $modalInstance.close(report);
    };
    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
