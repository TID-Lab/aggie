angular.module('Aggie')
    // This controller is for adding smtcTags to individual reports
.controller('SMTCTagSelectModalController', [
  '$rootScope',
  '$scope',
  '$modal',
  '$modalStack',
  'SMTCTag',
  'Report',
  'Tags',
  'Incident',
  'FlashService',
  '$translate',
  '$state',
  function($rootScope, $scope, $modal, $modalStack, SMTCTag, Report, Tags, Incident, flash, $translate, $state) {
    $scope.setSMTCTags = function(report) {
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
          incidents: ['Incident', function(Incident) {
            return Incident.query().$promise;
          }],
          sources: ['Source', function(Source) {
            return Source.query().$promise;
          }],
          report: function() {
            return report;
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
    'Report',
    'report',
    'incidents',
    'sources',
    'FlashService',
    'shared',
    function($scope, $modalInstance, $translate, smtcTags, SMTCTag, Report, report, incidents, sources, flash, shared) {
      $scope.smtcTags = angular.copy(smtcTags);
      $scope.smtcTagsById = {}
      $scope.incidents = incidents.results;
      $scope.incidentsById = {};
      $scope.sources = sources;
      $scope.sourcesById = {};
      $scope.selectedReport = angular.copy(report);
      $scope.showErrors = false;
      $scope.message = '';
      $scope.addedSMTCTagsIds = [];
      $scope.tagifyPlaceHolderText = $translate.instant('Type to Enter Tags');

      var init = function() {
        $scope.incidentsById = $scope.incidents.reduce(groupById, {});
        $scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});
        $scope.sourcesById = $scope.sources.reduce(groupById, {});
      }

      var groupById = function(memo, item) {
        memo[item._id] = item;
        return memo;
      };

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

      $scope.saveReport = function() {
        Report.save({ id: $scope.selectedReport._id }, $scope.selectedReport, function() {
        }, function() {
          flash.setAlertNow("Sorry, but that report couldn't be saved for some reason");
        });
      };

      $scope.unlinkIncident = function() {
        $scope.selectedReport._incident = '';
        Report.update({ id: $scope.selectedReport._id }, $scope.selectedReport);
      };

      $scope.toggleFlagged = function() {
        $scope.selectedReport.flagged = !$scope.selectedReport.flagged;
        if ($scope.selectedReport.flagged) {
          $scope.selectedReport.read = true;
        }
        $scope.saveReport();
      };

      $scope.isRead = function() {
        return $scope.selectedReport.read;
      }

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
              closeOnSelect: false,     // keep the dropdown open after selecting a suggestion
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

      $scope.sourceClass = function() {
        // Pick one of the sources that has a media type. For now, it happens that
        // if a report has multiple sources, they all have the same type, or are
        // deleted
        if ($scope.selectedReport.metadata.platform === "Facebook") {
          // set Facebook as source for CrowdTangle reports
          return 'facebook-source';
        } else {
          for (var i = 0; i < $scope.selectedReport._sources.length; i++) {
            var sourceId = $scope.selectedReport._sources[i];
            var source = $scope.sourcesById[sourceId];
            if (source && $scope.mediaOptions[source.media] !== -1) {
              return source.media + '-source';
            }
          }
          return 'unknown-source';
        }
      };
      init();
    }
  ]);
