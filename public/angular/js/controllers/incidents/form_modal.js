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

    $scope.create = function (report) {
      $modalStack.dismissAll();
      var modalInstance = $modal.open({
        controller: 'IncidentFormModalInstanceController',
        templateUrl: '/templates/incidents/modal.html',
        resolve: {
          users: ['User', function(User) {
            return User.query().$promise;
          }],
          incident: function () {
            return {
              veracity: null,
              closed: false
            };
          },
          report: function () {
            return report;
          }
        }
      });

      modalInstance.result.then(function(incident) {
        Incident.create(incident, function(inc) {
          if (report) {
            var batchMode = $location.url() === '/reports/batch';
            report.read = true;
            report._incident = inc._id;
            Report.update({id: report._id}, report, function () {
              if (batchMode) {
                $rootScope.$state.go('batch', {}, { reload: true });
              } else {
                $rootScope.$state.go('reports', { r: report }, { reload: false });
              }
            });
          } else {
            flash.setNotice('Incident was successfully created.');
            $rootScope.$state.go('incidents', {}, { reload: true });
          }
        }, function(err) {
          flash.setAlertNow('Incident failed to be created. Please contact support.');
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
          report: function () {
            return null;
          }
        }
      });

      modalInstance.result.then(function(incident) {
        Incident.update({ id: incident._id }, incident, function(response) {
          flash.setNotice('Incident was successfully updated.');
          if ($state.is('incidents')) {
            $state.go('incidents', { page: 1, title: null }, { reload: true });
          } else {
            $state.go('incident', { id: incident._id }, { reload: true });
          }
        }, function() {
          flash.setAlertNow('Incident failed to be updated.');
        });
      });
    };

    $scope.$watch('details.geometry.location', function(newVal, oldVal) {
      if (oldVal == newVal) return;
      $scope.incident.latitude = newVal.k;
      $scope.incident.longitude = newVal.D;
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
  'report',
  function($scope, $modalInstance, incidentStatusOptions, veracityOptions, users, incident, report) {
    $scope.incident = angular.copy(incident);
    $scope.users = users;
    $scope.veracity = veracityOptions;
    $scope.showErrors = false;
    $scope.report = report;
    $scope.minimal = !!report;
    $scope.minimalLatLng = true;

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope.showErrors = true;
        return;
      }
      // Don't need to send creator as it's not editable.
      delete $scope.incident.creator;

      // Only send assignedTo _id, not whole object.
      $scope.incident.assignedTo = ($scope.incident.assignedTo || {_id: null})['_id'];

      $modalInstance.close($scope.incident);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
