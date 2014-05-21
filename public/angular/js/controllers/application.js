angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  '$rootScope',
  '$location',
  'AuthService',
  'FlashService',
  function($scope, $rootScope, $location, AuthService, flash) {
    $scope.flash = flash;
  }
]);
