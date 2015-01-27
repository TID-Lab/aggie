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

    $scope.setIncident = function (report) {
      $modalStack.dismissAll();
      var modalInstance = $modal.open({
        windowClass: 'report-to-existing',
        size: 'lg',
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
  '$rootScope',
  '$scope',
  '$modalInstance',
  'incidents',
  'report',
  function($rootScope, $scope, $modalInstance, incidents, report) {
    $scope.report = angular.copy(report);
    $scope.incidents = incidents.results;
    $scope.modal = $modalInstance;
    $scope._showErrors = false;

    $scope.select = function (incident) {
      report._incident = incident._id;
      $modalInstance.close(report);
    }
    
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
