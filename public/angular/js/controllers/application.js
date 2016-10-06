angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  'Settings',
  'FlashService',
  '$sce',
  function($scope, Settings, flash, $sce) {
    $scope.flash = flash;
    Settings.get('gplaces', function success(data) {
      var src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + data.gplaces.key;
      $scope.gPlaces = $sce.trustAsResourceUrl(src);
      });
  }
]);
