angular.module('Aggie')
.controller('SettingsModalController', [
  '$scope',
  '$modal',
  function($scope, $modal) {
    $scope.edit = function(item, settings, set) {
      var modalInstance = $modal.open({
        controller: 'SettingsModalInstanceController',
        templateUrl: 'templates/' + set + '-settings-modal.html',
        resolve: {
          item: function() {
            return item;
          },
          settingsValues: function() {
            return settings;
          }
        }
      });
    };
  }])
.controller('SettingsModalInstanceController', [
  '$scope',
  '$modalInstance',
  'Settings',
  'FlashService',
  'settingsValues',
  'item',
  '$resource',
  '$filter',
  'tz',
  function($scope, $modalInstance, Settings, flash, settings, item, $resource, $filter, tz) {
    $scope.settings = settings;
    $scope.item = item;
    $scope._showErrors = false;
    $scope.loading = false;
    $scope.minimalLatLng = true;

    $scope.save = function(form, itemName, settings) {
      Settings.set(itemName, settings, success(itemName, 'saved'), failure);
      $modalInstance.close();
    };

    $scope.delete = function(itemName, settings) {

      for (var setting in settings) {
        settings[setting] = '';
      }

      Settings.set(itemName, settings, success(itemName, 'deleted'), failure);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.download = function(before, after) {
    var url = "/api/v1/viz";
    var afterDate = "";

    if(after === undefined){
      afterDate = "2000-01-01T00:00:00.000Z"
    }
    else{
      afterDate = after + ":00.277Z";
    }
    if(before === undefined){
      var today = new Date();
      var bString = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') +"-"+ String(today.getDate()).padStart(2, '0') + "T00:00:00.000Z";
      url = url.concat("/?before=" + bString + "&after=" + afterDate);
    }
    else{
      url = url.concat("/?before=" + before + ":00.277Z" + "&after=" + afterDate);
    }

    console.log(url);
    //gets reports from viz code
    $resource(url).get().$promise.then(function(res){ //success function
      var toWrite = "author \t authoredAt \t content \t fetchedAt \t flagged \t read \t tags \t url \t media";
      for(i=0; i < res.reports.length; i++) {
        //for each of the given rows, remove line breaks/tabs to correcly format output
        //output is a tsv, since commas frequently show up in plain
        var newString = "\n" + res.reports[i].author.replace(/(?:\r\n|\r|\n)/g, ' ') + "\t" +
                                res.reports[i].authoredAt.replace(/(?:\r\n|\r|\n)/g,' ') + "\t"+
                                res.reports[i].content.replace(/(?:\r\n|\r|\n)/g,' ') + "\t"+
                                res.reports[i].fetchedAt.replace(/(?:\r\n|\r|\n)/g,' ') + "\t"+
                                res.reports[i].flagged +"\t"+
                                res.reports[i].read +"\t"+
                                res.reports[i].tags[0].replace(/(?:\r\n|\r|\n)/g,' ') + "\t"+
                                res.reports[i].url.replace('\t','') +"\t"+
                                res.reports[i]._media[0].replace(/(?:\r\n|\r|\n)/g,' ');
        toWrite = toWrite.concat(newString);         
      }
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/tsv;charset=utf-8,' + encodeURIComponent(toWrite);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'reports.tsv';
      hiddenElement.click();
      $modalInstance.close();
    }, function(error){ //error function
      console.log(error);
      $modalInstance.close();
    })
    };

    function success(itemName, verb) {
      flash.setNoticeNow('settings.settingsModal.success',
                         { itemName: $filter('capitalize')(itemName),
                           verb: verb });
    }

    function failure(data) {
      flash.setAlertNow('settings.settingsModal.error');
      console.log('failure: ', data);
    }

    $scope.test = function(mediaName, settings) {
      $scope.success = false;
      $scope.failure = false;
      $scope.loading = true;
      Settings.test('media', mediaName, settings, successTest, failureTest);
    };

    function successTest(response) {
      $scope.loading = false;

      if (response.success) {
        $scope.success = true;
      } else {
        $scope.failure = true;
        $scope.message = response.message;
      }
    }

    function failureTest(data) {
      $scope.loading = false;

      $scope.failure = true;
      $scope.message = data.message;
    }

    $scope.$watch('details.geometry.location', function(newVal, oldVal) {
      if (oldVal === newVal) return;
      $scope.settings['latitude'] = $scope.details.geometry.location.lat();
      $scope.settings['longitude'] = $scope.details.geometry.location.lng();
    });
  }
]);