angular.module('Aggie')

.controller('FetchingController', [
  '$scope',
  'Fetching',
  'FlashService',
  function ($scope, Fetching, flash) {

    Fetching.get(function success(data) {
      $scope.on = data;
    }, failure);

    $scope.toggle = function (x) {
      $scope.on = x;
      console.log('Toggling!');
      Fetching.set($scope.on, success, failure);
    };

    function success(data) {
      flash.setNoticeNow('Fetching has been successfully switched.');
    };

    function failure(data) {
      flash.setAlertNow('An error has occurred setting the fetching status');
      console.log('failure: ', data);
    };
  }
]);
