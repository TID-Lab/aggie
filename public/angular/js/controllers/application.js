angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  'GPlacesSrc',
  'FlashService',
  function($scope, GPlacesSrc, flash) {
    $scope.flash = flash;
    $scope.gPlaces = '';

    $scope.$watch(GPlacesSrc.getSrc, function(newVal, oldVal, scope) {
      if (newVal) {
        scope.gPlaces = newVal;
      }
    }, true);

    GPlacesSrc.updateSrc();
  }
]);
