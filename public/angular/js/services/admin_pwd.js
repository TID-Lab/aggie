angular.module('Aggie')

.factory('AdminPwd',['$state', '$modal', '$http', 'FlashService',
  function($state, $modal, $http, flash) {

    return {
      openModal: function() {
        var modalInstance = $modal.open({
          controller: 'AdminChoosePasswordModalInstanceController',
          templateUrl: 'templates/admin_choose_password_modal.html',
          backdrop: 'static',
          keyboard: false
        });

        modalInstance.result.then(function() {
          flash.setNoticeNow('Admin password succesfully changed');
        });
      }
    };
}]);
