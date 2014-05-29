angular.module('Aggie')

.controller('TrendsIndexController', [
  '$state',
  '$scope',
  '$rootScope',
  'FlashService',
  'trends',
  'Trend',
  'Socket',
  function($state, $scope, $rootScope, flash, trends, Trend, Socket) {
    $scope.trend = {};
    $scope.trends = trends;

    var updateTrendCount = function(trend) {
      angular.forEach($scope.trends, function(t) {
        if (t._id == trend._id) {
          if (!t.counts || trend.counts.length > t.counts.length) {
            t.displayCounts = trend.counts.map(function(c) {
              return c.counts;
            }).reverse().join();
          }
        }
      });
    };

    angular.forEach($scope.trends, function(trend) {
      Trend.get({id: trend._id}, function(t) {
        updateTrendCount(t);
      });
    });

    Socket.on('trend', updateTrendCount);
  }
]);

