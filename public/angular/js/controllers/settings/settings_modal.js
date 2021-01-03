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
    //ToDo: - Get dates from user input, index reports based on given dates
    //      - Set default date range to include all reports
    var url = "/api/v1/viz";
    beforeDate = tz(new Date(), before);
    afterDate = tz(new Date(), after);

    url = url.concat("/?before=" + beforeDate.toISOString() + "/?after=" + afterDate.toISOString());
    console.log(beforeDate);
    console.log(after);
    //gets reports from viz code
    $resource(url).get().$promise.then(function(res){ //success function
      //headers for tsv
      var toWrite = "author \t authoredAt \t content \t fetchedAt \t flagged \t read \t tags \t url \t media";
      //for each report, create a new line and a tab separated string for data. Replace all other newline characters with a space
      for(i=0; i < res.reports.length; i++) {
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
      //create and click the csv file to download
      //console.log(toWrite);
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/tsv;charset=utf-8,' + encodeURIComponent(toWrite);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'reports.tsv';
      //hiddenElement.click();
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