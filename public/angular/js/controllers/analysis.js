angular.module('Aggie')

.controller('AnalysisController', [
  '$scope',
  'Socket',
  function($scope, Socket) {
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
