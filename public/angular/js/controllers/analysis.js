angular.module('Aggie')

.controller('AnalysisController', [
  '$scope',
  'Socket',
  'data',
  function($scope, Socket, data) {
    $scope.data = data;
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
