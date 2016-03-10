angular.module('Aggie')

.controller('EmailSettingsController', [
  '$scope',
  'Settings',
  '$timeout',
  '$filter',
  'FlashService',
//  'mediaSettingsOptions',
//  'MediaSettingsModal',
  function($scope, Settings, $timeout, $filter, flash) {

    $scope.mail = "";
    $scope.transport = {};
    Settings.get('email', function success(data){
      $scope.email = data.email.from;
      $scope.transport = angular.copy(data.email.transport);
    }, failure)
    // $scope.media = {};
    
    // mediaSettingsOptions.forEach(getSetting);

    // $scope.mediaOptions = mediaSettingsOptions;
    // $scope.edit = function(media) {
    //   var modalInstance = modal.create(media, $scope.media[media]);
    // };

    // $scope.toggle = function(mediaName, value) {
    //   var mediaSettings = $scope.media[mediaName];
    //   var setting = {};

    //   setting.on = value;

    //   if (value && mediaSettings.configured || !value) {
    //     Settings.set(mediaName, setting, success(mediaName, setting, value), failure);
    //   } else {
    //     var modalInstance = modal.create(mediaName, mediaSettings);
    //   };
    // };

    // function getSetting(name, index, mediaItems) {
    //   Settings.get(name, function success(data) {
    //     $scope.media[data.setting] = angular.copy(data[data.setting]);
    //   }, failure);

    // };
    function success() {
      flash.setNoticeNow('The mail setting has been correctly saved');
    };

    $scope.saveEmail = function(){
      Settings.set('email', { from: $scope.email }, success, failure);
    }

    $scope.editTransport = function(){
      
    }
    function failure(data) {
      flash.setAlertNow('An error has occurred saving the email setting');
      console.log('failure: ', data);
    };
  },
]);
