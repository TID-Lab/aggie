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
        flash.notice = null;
      },

      setNotice: function(message) {
        flash.notice = message;
        flash.alert = null;
     },

      setAlertNow: function(message) {
        currentFlash.alert = message;
        currentFlash.notice = null;
      },

      setNoticeNow: function(message) {
        currentFlash.notice = message;
        currentFlash.alert = null;
      }
    };
  }
]);
