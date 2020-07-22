angular.module('Aggie').controller('PasswordResetModalController', [
  '$rootScope',
  '$scope',
  '$state',
  '$modal',
  '$http',
  'FlashService',
  function($rootScope, $scope, $state, $modal, $http, flash) {
    var init = function() {
        modalInstance.result.then(function(email) {
        $http.post('/reset-password', { email: email })
          .success(function(response) {
            flash.setNoticeNow('passwordReset.email.success', { email: email });
          })
          .error(function(mesg, status) {
            if (status == 404) {
              flash.setAlertNow('passwordReset.email.noUser', { email: email });
            } else {
              flash.setAlertNow('passwordReset.email.error');
            }
          });
      });
    };
  }
])
