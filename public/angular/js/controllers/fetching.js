angular.module('Aggie')

.controller('FetchingController', [
  '$scope',
  'Fetching',
  'FlashService',
  function($scope, Fetching, flash) {

    Fetching.get(function success(data) {
      $scope.on = data;
    }, failure);

    $scope.toggle = function(x) {
      Fetching.set(x, success(x), failure);
    };

    function success(data) {
      $scope.on = data;
    }

    function failure(data) {
      flash.setAlertNow('An error has occurred setting the fetching status');
      console.log('failure: ', data);
    }
  }
]);
