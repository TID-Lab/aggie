angular.module('Aggie')

.controller('TagsIndexController', [
  '$scope',
  '$rootScope',
  'smtcTags',
  'SMTCTag',
  'FlashService',
  'Socket',
  function($scope, $rootScope, smtcTags, SMTCTag, flash, Socket) {
    $scope.smtcTags = smtcTags;
    var init = function() {
      Socket.on('stats', updateStats);
      Socket.join('stats');
    }
    var updateStats = function(stats) {
      $scope.stats = stats;
    };

    $scope.deleteSMTCTag = function(smtcTag) {
      // Deletes from Back-End
      SMTCTag.delete({_id: smtcTag._id}, function () {
        flash.setNoticeNow('smtcTag.delete.success');
        // Deletes from Front-End Scope
        angular.forEach($scope.smtcTags, function (s, i) {
          if (s._id == smtcTag._id) {
            $scope.smtcTags.splice(i, 1);
          }
        })
      }, function () {
        flash.setAlertNow('smtcTag.delete.error');
      });
    }

    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });
    init();
  }
]);
