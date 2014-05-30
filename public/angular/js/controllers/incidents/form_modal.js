angular.module('Aggie')

.controller('IncidentFormModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  'Incident',
  'FlashService',
  function($rootScope, $scope, $modal, Incident, flash) {
    $scope.create = function() {
      var modalInstance = $modal.open({
        controller: 'IncidentFormModalInstanceController',
        templateUrl: 'templates/incidents/modal.html',
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
          flash.setNoticeNow('Incident was successfully created.');
          $scope.incidents[inc._id] = inc;
          $rootScope.$state.go('incidents', {}, { reload: true });
        }, function(err) {
          flash.setAlertNow('Incident failed to be created. Please contact support.');
        });
      });
    };
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
    $scope.status = incidentStatusOptions;
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
