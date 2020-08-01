angular.module('Aggie')

.controller('TagsIndexController', [
  '$scope',
  '$rootScope',
  'smtcTags',
  'SMTCTag',
  'FlashService',
  'Socket',
  function($scope, $rootScope, smtcTags, SMTCTag, flash, Socket) {
    $scope.smtcTags = smtcTags;
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
