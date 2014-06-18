angular.module('Aggie')

.controller('IncidentsMapController', [
  '$state',
  '$scope',
  '$rootScope',
  '$stateParams',
  'FlashService',
  'incidents',
  'Map',
  function($state, $scope, $rootScope, $stateParams, flash, incidents, Map) {
    var map = new Map({
      locations: incidents.results,
      info_window_url: '/api/v1/incident/'
    });
  }
]);
