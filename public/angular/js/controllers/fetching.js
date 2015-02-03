angular.module('Aggie')

.controller('FetchingController', [
  '$scope',
  'Fetching',
  '$timeout',
  function($scope, Fetching, $timeout) {

    Fetching.get(function success(data) {
      $scope.on = data;
    }, failure);

    $scope.toggle = function (x) {
      $scope.on = x;
    };

    $scope.save = function () {
      $scope.loading = true;
      Fetching.set($scope.on, success, failure);
    };

    function success (data) {
      // a tiny delay just in case the response is
      // so super-fast, user doesn't see any indication
      $timeout(function () {
        $scope.loading = false;
      }, 300);
    }

    function failure (data) {
      console.log('failure: ', data);
    }
  }
]);
