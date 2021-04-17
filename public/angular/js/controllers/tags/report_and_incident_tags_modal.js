angular.module('Aggie')
    // This controller is for adding smtcTags to individual reports
    // This controller uses the Tagify Element (https://github.com/yairEO/tagify)
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
        templateUrl: '/templates/tags/report_smtcTag_modal.html',
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
        smtcTagIds.map(function (tag) {
          return { _id: tag._id }
        });
        report.smtcTags = smtcTagIds;
        report.read = true;
        Report.update({ id: report._id }, report);
      });
    };

    $scope.setIncidentSMTCTags = function(incident) {
      $modalStack.dismissAll();
      var modalInstance = $modal.open({
        windowClass: 'report-to-existing',
        size: 'xl',
        controller: 'IncidentSMTCTagSelectModalInstanceController',
        templateUrl: '/templates/tags/incident_smtcTag_modal.html',
        resolve: {
          smtcTags: ['SMTCTag', function(SMTCTag) {
            return SMTCTag.query().$promise;
          }],
          sources: ['Source', function(Source) {
            return Source.query().$promise;
          }],
          incident: function() {
            return incident;
          }
        }
      });
      modalInstance.result.then(function(smtcTagIds) {
        smtcTagIds.map(function (tag) {
          return { _id: tag._id }
        });
        incident.smtcTags = smtcTagIds;
        Incident.update({ id: incident._id }, incident);
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
      $scope.tagifySMTCTagsIds = [];
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

      /* Tagify Functions
       * In order to use the tagify library, smtcTags must be converted into tagify format, then added to the tagify
       * element's whitelist. As the default tagify format supports two fields, the value field is equal to the name
       * and the title field is equal to the smtcTag Id. This allows the tagify element to parse any inputs into the
       * tagify element. However, when saving the smtcTag values back to the Report, tagify tags must be converted
       * back to an array smtcTagIds.
       */
      // Formats the tags for tagify
      var tagifyFormatTags = function(smtcTags) {
        return smtcTags.map(function (smtcTag) {
          return { title: smtcTag._id, value: smtcTag.name};
        });
      };

      // This function transforms tagify tag colors to match the smtcTag color
      var transformTag = function(tagData) {
        // TODO: Make a Tagify template so that we can make code more intuitive. See template under Tagify Settings API.
        tagData.style = "--tag-bg:" + $scope.smtcTagsById[tagData.title].color;
      }

      // This function transforms tagify tags to an array of SMTCTag Ids
      $scope.save = function() {
        // We don't use a form validation because the tagify element provides all the input parsing
        $scope.tagifyElement.getTagElms().forEach( function(TagDomElement) {
          $scope.tagifySMTCTagsIds.push(TagDomElement.title);
        });
        $modalInstance.close($scope.tagifySMTCTagsIds);
      };

      $scope.close = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.saveReport = function() {
        Report.save({ id: $scope.selectedReport._id }, $scope.selectedReport, function() {
        }, function() {
          flash.setAlertNow("Sorry, but that report couldn't be saved.");
        });
      };


      $scope.isRead = function() {
        return $scope.selectedReport.read;
      }

      // This function removes all tags from the input bar
      $scope.removeAllTags = function() {
        $scope.tagifyElement.removeAllTags();
        $scope.addedSMTCTagsIds = [];
      }

      // This function adds the previously added tags to the tagify input
      $scope.loadReportTags = function(tagifyElement) {
        $scope.selectedReport.smtcTags.forEach( function(tag) {
          tagifyElement.addTags([{
            value: $scope.smtcTagsById[tag].name,
            title: $scope.smtcTagsById[tag]._id
          }]);
        })
      }

      $scope.tagify = function() {
        /* Because we are manipulating the DOM, tag inputs don't actually load on init(). This means that running a
         * forEach statement in init (like linkify) doesn't work because DOM elements can't be found. Instead this
         * function is run when the element is loaded using ng-init. THIS IS NOT HOW NG-INIT is supposed to be
         * used. I would otherwise use a component, but this was coded in angular 1.2 which doesn't have good component
         * support.
         */
        var tagifyElement = angular.element('input[name=tagifySMTCTags]');
        // Add Translated Placeholder Text
        tagifyElement.attr("placeholder", $scope.tagifyPlaceHolderText);
        tagifyElement.tagify({
          enforceWhitelist: true,
          whitelist: tagifyFormatTags($scope.smtcTags),
          autocomplete: true,
          transformTag: transformTag,
          dropdown : {
            classname: "color-blue",
            enabled: 0,              // show the dropdown immediately on focus
            maxItems: 5,
            position: "text",         // place the dropdown near the typed text
            closeOnSelect: false,     // keep the dropdown open after selecting a suggestion
            highlightFirst: true,
          }
        });
        $scope.tagifyElement = tagifyElement.data('tagify');
        $scope.loadReportTags($scope.tagifyElement);

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
  ])
  .controller('IncidentSMTCTagSelectModalInstanceController', [
    '$scope',
    '$modalInstance',
    '$translate',
    'smtcTags',
    'SMTCTag',
    'Report',
    'incident',
    'FlashService',
    'shared',
    function($scope, $modalInstance, $translate, smtcTags, SMTCTag, Report, incident, flash, shared) {
      $scope.smtcTags = angular.copy(smtcTags);
      $scope.smtcTagsById = {}
      $scope.selectedIncident = angular.copy(incident);
      $scope.showErrors = false;
      $scope.message = '';
      $scope.tagifySMTCTagsIds = [];
      $scope.tagifyPlaceHolderText = $translate.instant('Type to Enter Tags');

      var init = function() {
        $scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});
      }

      var groupById = function(memo, item) {
        memo[item._id] = item;
        return memo;
      };

      /* Tagify Functions
       * In order to use the tagify library, smtcTags must be converted into tagify format, then added to the tagify
       * element's whitelist. As the default tagify format supports two fields, the value field is equal to the name
       * and the title field is equal to the smtcTag Id. This allows the tagify element to parse any inputs into the
       * tagify element. However, when saving the smtcTag values back to the Report, tagify tags must be converted
       * back to an array smtcTagIds.
       */
      // Formats the tags for tagify
      var tagifyFormatTags = function(smtcTags) {
        return smtcTags.map(function (smtcTag) {
          return { title: smtcTag._id, value: smtcTag.name};
        });
      };

      // This function transforms tagify tag colors to match the smtcTag color
      var transformTag = function(tagData) {
        // TODO: Make a Tagify template so that we can make code more intuitive. See template under Tagify Settings API.
        tagData.style = "--tag-bg:" + $scope.smtcTagsById[tagData.title].color;
      }

      // This function transforms tagify tags to an array of SMTCTag Ids
      $scope.save = function() {
        // We don't use a form validation because the tagify element provides all the input parsing
        $scope.tagifyElement.getTagElms().forEach( function(TagDomElement) {
          $scope.tagifySMTCTagsIds.push(TagDomElement.title);
        });
        $modalInstance.close($scope.tagifySMTCTagsIds);
      };

      $scope.close = function() {
        $modalInstance.dismiss('cancel');
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

      // This function removes all tags from the input bar
      $scope.removeAllTags = function() {
        $scope.tagifyElement.removeAllTags();
        $scope.addedSMTCTagsIds = [];
      }

      // This function adds the previously added tags to the tagify input
      $scope.loadReportTags = function(tagifyElement) {
        $scope.selectedIncident.smtcTags.forEach( function(tag) {
          tagifyElement.addTags([{
            value: $scope.smtcTagsById[tag].name,
            title: $scope.smtcTagsById[tag]._id
          }]);
        })
      }

      $scope.tagify = function() {
        /* Because we are manipulating the DOM, tag inputs don't actually load on init(). This means that running a
         * forEach statement in init (like linkify) doesn't work because DOM elements can't be found. Instead this
         * function is run when the element is loaded using ng-init. THIS IS NOT HOW NG-INIT is supposed to be
         * used. I would otherwise use a component, but this was coded in angular 1.2 which doesn't have good component
         * support.
         */
        var tagifyElement = angular.element('input[name=tagifySMTCTags]');
        // Add Translated Placeholder Text
        tagifyElement.attr("placeholder", $scope.tagifyPlaceHolderText);
        tagifyElement.tagify({
          enforceWhitelist: true,
          whitelist: tagifyFormatTags($scope.smtcTags),
          autocomplete: true,
          transformTag: transformTag,
          dropdown : {
            classname: "color-blue",
            enabled: 0,              // show the dropdown immediately on focus
            maxItems: 5,
            position: "text",         // place the dropdown near the typed text
            closeOnSelect: false,     // keep the dropdown open after selecting a suggestion
            highlightFirst: true,
          }
        });
        $scope.tagifyElement = tagifyElement.data('tagify');
        $scope.loadReportTags($scope.tagifyElement);

      };
      init();
    }
  ]);
