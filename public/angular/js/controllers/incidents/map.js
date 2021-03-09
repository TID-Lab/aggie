angular.module('Aggie')

.controller('IncidentsMapController', [
  '$state',
  '$scope',
  '$rootScope',
  '$transition$',
  'FlashService',
  'incidents',
  'Map',
  function($state, $scope, $rootScope, $transition$, flash, incidents, Map) {
    var map = new Map({
      locations: incidents.results,
      info_window_url: '/api/v1/incident/'
    });
  }
]);
