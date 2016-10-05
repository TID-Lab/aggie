angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  'Settings',
  'FlashService',
  '$sce',
  function($scope, Settings, flash, $sce) {
    $scope.flash = flash;

    Settings.get('google', function success(data) {
      var src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + data[data.setting].key;
      $scope.gPlaces = $sce.trustAsResourceUrl(src);
      });
  }
]);
