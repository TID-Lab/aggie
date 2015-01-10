angular.module('Aggie')

.controller('FetchingController', [
  '$scope',
  'Fetching',
  function($scope, Fetching) {

    Fetching.get(function success (data) {
      $scope.on = data;
    }, failure);

    $scope.toggle = function (x) {
      $scope.on = x;
    };

    $scope.save = function () {
      Fetching.set($scope.on, null, failure);
    };

    function failure (data) {
      console.log('failure: ', data);
    }
  }
]);
