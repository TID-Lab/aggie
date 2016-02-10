angular.module('Aggie')

.factory('admin_pwd',['$state', '$modal', '$http', 'FlashService',
  function($state, $modal, $http, flash) {

  return {
    openModal: function() {
      var modalInstance = $modal.open({
        controller: 'AdminChoosePasswordModalInstanceController',
        templateUrl: 'templates/admin_choose_password_modal.html',
        backdrop: 'static',
        keyboard: true
      });

      modalInstance.result.then(function() {
            flash.setNoticeNow('Admin password succesfully changed' );
            $state.go('reports');
      });
    }
  }
}]);
