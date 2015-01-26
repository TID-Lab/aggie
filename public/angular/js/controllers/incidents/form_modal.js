angular.module('Aggie')

.controller('IncidentFormModalController', [
  '$rootScope',
  '$scope',
  '$state',
  '$modal',
  'Incident',
  'FlashService',
  function($rootScope, $scope, $state, $modal, Incident, flash) {
    $scope.create = function() {
      var modalInstance = $modal.open({
        controller: 'IncidentFormModalInstanceController',
        templateUrl: '/templates/incidents/modal.html',
        resolve: {
          users: ['User', function(User) {
            return User.query().$promise;
          }],
          incident: function() {
            return {};
          }
        }
      });

      modalInstance.result.then(function(incident) {
        Incident.create(incident, function(inc) {
          flash.setNotice('Incident was successfully created.');
          $scope.incidents[inc._id] = inc;
          $rootScope.$state.go('incidents', {}, { reload: true });
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
  function($scope, $modalInstance, incidentStatusOptions, veracityOptions, users, incident) {
    $scope.incident = angular.copy(incident);
    $scope.users = users.map(function(u) {
      return u.username;
    });
    $scope.veracity = veracityOptions;
    $scope.showErrors = false;

    $scope.save = function(form) {      
      if (form.$invalid) {
        $scope.showErrors = true;
        return;
      }
      $modalInstance.close($scope.incident);
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
  }
]);
