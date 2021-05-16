/**
 * The way that we make modals work in Angular JS + Bootstrap is we create a new controller
 * (IncidentFormModalInstanceController) and template (/templates/incidents/modal.html) through another intermediary
 * controller (IncidentFormModalController) which "controls" the modal nature of the modal. This intermediary controller
 * has create/edit functions. These create/edit functions open a template and corresponding controller using the $modal
 * service. This service takes in a controller and a template and resolves variables through this function. When the
 * modal is closed, it runs the modalInstance.result.then() function which runs the API calls necessary to create
 * changes.
 */

angular.module('Aggie')
  .controller('IncidentFormModalController', [
  '$rootScope',
  '$scope',
  '$q',
  '$state',
  '$modal',
  '$modalStack',
  '$location',
  'Incident',
  'Report',
  'FlashService',
  function($rootScope, $scope, $q, $state, $modal, $modalStack, $location, Incident, Report, flash) {
    /**
     * This function creates a new incident by opening a template/controller with the modal service. If the incident is
     * created through the report_incident_modal then reports is not an empty array. Users and default incident details
     * need to be displayed here as well, so we resolve these here as well.
     * @param reports to be added to the new incident.
     */
    $scope.create = function(reports) {
      $modalStack.dismissAll();
      var modalInstance = $modal.open({
        controller: 'IncidentFormModalInstanceController',
        templateUrl: '/templates/incidents/modal.html',
        resolve: {
          users: ['User', function(User) {
            return User.query().$promise;
          }],
          incident: function() {
            return {
              veracity: 'Unconfirmed',
              closed: false
            };
          },
          reports: function() {
            return reports || [];
          }
        }
      });
      modalInstance.result.then(function(incident) {
        Incident.create(incident, function(inc) {
          if (reports) {
            var batchMode = $location.url() === '/reports/batch';
            var ids = reports.map(function(report) {
              return report._id;
            });
            Report.linkToIncident({ ids: ids, incident: inc._id }, function() {
              if (batchMode) {
                $rootScope.$state.go('batch', {}, { reload: true });
              } else {
                $rootScope.$state.go('reports', { r: reports[0] }, { reload: false });
              }
            });
          } else {
            flash.setNotice('incident.create.success');
            $rootScope.$state.go('incidents', {}, { reload: true });
          }
        }, function(err) {
          flash.setAlertNow('incident.create.error');
        });
      });
    };

    /**
     * Essentially the same as the create function but edits an incident instead of creating a new one.
     * @param incident that is being edited.
     */
    $scope.edit = function(incident) {
      var modalInstance = $modal.open({
        controller: 'IncidentFormModalInstanceController',
        templateUrl: '/templates/incidents/modal.html',
        resolve: {
          users: ['User', function(User) {
            return User.query().$promise;
          }],
          incident: function() {
            return incident;
          },
          reports: function() {
            return [];
          }
        }
      });
      modalInstance.result.then(function(incident) {
        Incident.update({ id: incident._id }, incident, function(response) {
          flash.setNotice('incident.update.success');
          if ($state.is('incidents')) {
            $state.go('incidents', { page: 1, title: null }, { reload: true });
          } else {
            $state.go('incident', { id: incident._id }, { reload: true });
          }
        }, function() {
          flash.setAlertNow('incident.update.error');
        });
      });
    };
    $scope.$watch('details.geometry.location', function(newVal, oldVal) {
      if (oldVal == newVal) return;
      $scope.incident.latitude = $scope.details.geometry.location.lat();
      $scope.incident.longitude = $scope.details.geometry.location.lng();
    });
  }
])

  /**
   * This controller actually controls what occurs within the modal and not the modal nature (close, open) itself. So
   * this is effectively the controller for the form that creates or edits an incident.
   */
  .controller('IncidentFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'incidentStatusOptions',
  'veracityOptions',
  'users',
  'incident',
  'reports',
  'Tags',
  function($scope, $modalInstance, incidentStatusOptions, veracityOptions, users, incident, reports, Tags) {
    $scope.incident = angular.copy(incident);
    $scope.users = users;
    $scope.veracity = veracityOptions;
    $scope.showErrors = false;
    $scope.reports = reports;
    $scope.minimal = reports.length > 0;
    $scope.minimalLatLng = true;

    /**
     * This takes in the form that edits/creates an incident, checks for errors and performs the appropriate formatting
     * before closing the modal and executing the modalInstance.result.then function in the IncidentFormModalController.
     * @param form containing filled out new information about an incident.
     */
    $scope.save = function(form) {
      if (form.$invalid) {
        $scope.showErrors = true;
        return;
      }
      // Don't need to send creator as it's not editable.
      delete $scope.incident.creator;
      // Only send assignedTo _id, not whole object.
      $scope.incident.assignedTo = ($scope.incident.assignedTo || { _id: null })['_id'];
      $scope.incident.tags = Tags.stringToTags($scope.incident.tags);
      $modalInstance.close($scope.incident);
    };

    /**
     * This simply closes the modal instance and does not run anything afterwards.
     */
    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
