angular.module('Aggie').factory('FlashService', [
  '$rootScope',
  function($rootScope) {
    var flash = {}, currentFlash = {};

    $rootScope.$on('$stateChangeSuccess', function() {
      currentFlash = flash;
      flash = {};
    });

    return {
      getAlert: function() {
        return currentFlash.alert;
      },

      getNotice: function() {
        return currentFlash.notice;
      },

      setAlert: function(message) {
        flash.alert = message;
      },

      setNotice: function(message) {
        flash.notice = message;
     },

      setAlertNow: function(message) {
        currentFlash.alert = message;
      },

      setNoticeNow: function(message) {
        currentFlash.notice = message;
      }
    };
  }
]);
