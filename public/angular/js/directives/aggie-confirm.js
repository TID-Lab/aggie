angular.module('Aggie')

.directive('aggieConfirm', ['$modal', function($modal) {

  var modalInstanceController = [
    '$scope',
    '$modalInstance',
    function($scope, $modalInstance) {
      $scope.confirm = function() {
        $modalInstance.close();
      };

      $scope.cancel = function() {
        $modalInstance.dismiss();
      };
    }
  ];

  return {
    scope: {
      message: '@aggieConfirm',
      onConfirm: '&'
    },

    controller: [
      '$scope',
      function($scope) {
        $scope.openModal = function() {
          $modal.open({
            controller: modalInstanceController,
            scope: $scope,
            templateUrl: '/templates/confirm_modal.html'
          }).result.then(function() {
            $scope.onConfirm();
          });
        };
      }
    ],

    link: function($scope, $el) {
      $el.on('click', $scope.openModal);
    }
  };
}]);
