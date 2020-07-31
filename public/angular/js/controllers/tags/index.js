angular.module('Aggie')

.controller('TagsIndexController', [
  '$scope',
  '$rootScope',
  'FlashService',
  'Socket',
  function($scope, $rootScope, flash, Socket) {

    var init = function() {
      Socket.on('stats', updateStats);
      Socket.join('stats');
    }
    var updateStats = function(stats) {
      $scope.stats = stats;
    };

    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
