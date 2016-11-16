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
              veracity: null,
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

.controller('IncidentFormModalInstanceController', [
  '$scope',
  '$modalInstance',
  'incidentStatusOptions',
  'veracityOptions',
  'users',
  'incident',
  'reports',
  'Tags',
  function($scope, $modalInstance, incidentStatusOptions, veracityOptions,
           users, incident, reports, Tags) {
    $scope.incident = angular.copy(incident);
    $scope.users = users;
    $scope.veracity = veracityOptions;
    $scope.showErrors = false;
    $scope.reports = reports;
    $scope.minimal = reports.length > 0;
    $scope.minimalLatLng = true;

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

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
