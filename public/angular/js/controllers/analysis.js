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

    $scope.initiateDashboard = function() {
      $scope.svgBar = d3.select('figure#aggie-viz')
      .append('svg').attr('width', '100%').attr('viewBox', '0 0 1400 800');
    }

    $scope.processData = function(data) {

      let actualStatistics = [];
      let expectedStatistics = [];

      for (let property in data[0].metadata.actualStatistics) {
        actualStatistics.push({
          type: property,
          count: 0
        });
    
        expectedStatistics.push({
          type: property,
          count: 0
        });
      }
    
      for (let post of data) {
        for (let prop in post.metadata.actualStatistics) {
          let actReaction = actualStatistics.find(reaction => reaction.type == prop);
          let expReaction = expectedStatistics.find(reaction => reaction.type == prop);
          actReaction.count += post.metadata.actualStatistics[prop];
          expReaction.count += post.metadata.expectedStatistics[prop];
        }
      }

      $scope.actualStatistics = actualStatistics;
      $scope.expectedStatistics = expectedStatistics;

      console.log($scope.actualStatistics);
    }

    init();
    $scope.processData($scope.data);
    $scope.initiateDashboard();
  }
]);
