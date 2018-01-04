angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  'FlashService',
  function($scope, flash) {
    $scope.flash = flash;
  }
]);
