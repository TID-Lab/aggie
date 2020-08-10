angular.module('Aggie')

.controller('SMTCTagSelectModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  '$modalStack',
  'SMTCTag',
  'Report',
  'Tags',
  'FlashService',
  '$translate',
  '$state',
  function($rootScope, $scope, $modal, $modalStack, SMTCTag, Report, Tags, flash, $translate, $state) {
    $scope.setSMTCTags = function(reports) {
      $modalStack.dismissAll();
      var modalInstance = $modal.open({
        windowClass: 'report-to-existing',
        size: 'xl',
        controller: 'SMTCTagSelectModalInstanceController',
        templateUrl: 'templates/tags/report_smtcTag_modal.html',
        resolve: {
          smtcTags: ['SMTCTag', function(SMTCTag) {
            return SMTCTag.query().$promise;
          }],
          reports: function() {
            if (!reports) {
              reports = $scope.filterSelected($scope.reports);
            }
            return reports;
          }
        }
      });
      modalInstance.result.then(function(smtcTagIds) {
        var ids = reports.map(function(report) {
          return report._id;
        });
        //console.log(ids, smtcTagIds);
      });
    };
  }
])

  .controller('SMTCTagSelectModalInstanceController', [
    '$scope',
    '$modalInstance',
    '$translate',
    'smtcTags',
    'SMTCTag',
    'reports',
    'FlashService',
    'shared',
    function($scope, $modalInstance, $translate, smtcTags, SMTCTag, reports, flash, shared) {
      $scope.smtcTags = angular.copy(smtcTags);
      $scope.selectedReports = angular.copy(reports);
      $scope.showErrors = false;
      $scope.message = '';
      $scope.addedSMTCTagsIds = [];
      $scope.tagifyPlaceHolderText = $translate.instant('Type to Enter Tags');
      // Returns an array of tag names
      var namesOfTags = function(smtcTags) {
        return smtcTags.map(function (smtcTag) {
          return smtcTag.name;
        });
      };

      var nameToTagId = function(name) {
        var index = $scope.smtcTags.findIndex(function(smtcTag) {
          return smtcTag.name == name;
        });
        return $scope.smtcTags[index]._id;
      }

      var handleSuccess = function(response) {
        $modalInstance.close(response);
      };

      var handleError = function(response) {
        if (response.status == 502) {
          $scope.message = 'smtcTag.create.tagAlreadyExists';
        } else {
          $translate(response.data).then(function(error) {
            $scope.message = error;
          }).catch(function() {
            if ($scope.smtcTag._id) {
              $scope.message = 'smtcTag.update.error';
            } else {
              $scope.message = 'smtcTag.create.error';
            }
          });
        }
      };

      $scope.save = function(form) {
        if (form.$invalid) {
          $scope.showErrors = true;
          return;
        }
        if ($scope.user._id) {

        } else {

        }
      };

      $scope.close = function() {
        $modalInstance.dismiss('cancel');
      };

      // Tagify Event Listeners
      $scope.onAddSMTCTag = function(e, addedTag) {
        console.log('JQEURY EVENT: ', 'added', addedTag);
        $scope.addedSMTCTagsIds.push(nameToTagId(addedTag.data.value));
      };

      $scope.onRemoveSMTCTag = function(e, addedTag) {
        console.log('JQEURY EVENT: ',"remove", e, ' ', addedTag);
      };

      $scope.onInvalidSMTCTagAdd = function(e, addedTag) {
        console.log('JQEURY EVENT: ',"invalid", e, ' ', addedTag);
      };

      $scope.removeAllTags = function() {
        console.log('Removed: ', $scope.tagifyElement.getTagElms());
        $scope.tagifyElement.removeAllTags();
        $scope.addedSMTCTagsIds = [];
      }

      $scope.loadReportTags = function() {

      }

      $scope.tagify = function() {
        // Because we are manipulating the DOM, tag inputs don't actually load on init(). This means that running a
        // forEach statement in init (like linkify) doesn't work because DOM elements can't be found. Instead this
        // function is run when the element is loaded using ng-init. THIS IS NOT HOW NG-INIT is supposed to be
        // used. I would otherwise use a component, but this was coded in angular 1.2 which doesn't have good component
        // support

        var tagifyElement = angular.element('input[name=tagifySMTCTags]');
        // Add Translated Placeholder Text
        tagifyElement.attr("placeholder", $scope.tagifyPlaceHolderText);
        tagifyElement.tagify({
            enforceWhitelist: true,
            whitelist: namesOfTags($scope.smtcTags),
            autocomplete: true,
            dropdown : {
              classname: "color-blue",
              enabled: 0,              // show the dropdown immediately on focus
              maxItems: 5,
              position: "text",         // place the dropdown near the typed text
              closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
              highlightFirst: true
            }
        }).on('add', function(e, tagName){ // Attach Event Listeners
            $scope.onAddSMTCTag(e, tagName);
          })
          .on('removeTag', function(e, tagName){
            $scope.onRemoveSMTCTag(e, tagName);
          })
          .on("invalid", function(e, tagName) {
            $scope.onInvalidSMTCTagAdd(e, tagName);
          });
        $scope.tagifyElement = tagifyElement.data('tagify');
        $scope.loadReportTags();
      };
    }
  ]);
