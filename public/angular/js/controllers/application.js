angular.module('Aggie')

.controller('ApplicationController', [
  '$scope',
  '$rootScope',
  '$location',
  'AuthService',
  'FlashService',
  'Source',
  'Socket',
  function($scope, $rootScope, $location, AuthService, flash, Source, Socket) {
    $scope.flash = flash;

    Socket.on('sourceErrorCountUpdated', function(source) {
      $rootScope.sourceWithErrors = source;
    });
  }
]);
