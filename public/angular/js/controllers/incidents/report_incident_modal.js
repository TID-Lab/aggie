angular.module('Aggie')

.controller('IncidentSelectModalController', [
  '$rootScope',
  '$scope',
  '$q',
  '$location',
  '$modal',
  '$modalStack',
  'Incident',
  'Report',
  'SMTCTag',
  'FlashService',
  function($rootScope, $scope, $q, $location, $modal, $modalStack, Incident, Report, SMTCTag, flash) {

    $scope.setIncident = function(reports) {
      $modalStack.dismissAll();
      var modalInstance = $modal.open({
        windowClass: 'report-to-existing',
        size: 'xl',
        controller: 'IncidentSelectModalInstanceController',
        templateUrl: '/templates/incidents/report_incident_modal.html',
        resolve: {
          incidents: ['Incident', function(Incident) {
            return Incident.query().$promise;
          }],
          smtcTags: ['SMTCTag', function(SMTCTag) {
            return SMTCTag.query().$promise;
          }],
          sources: ['Source', function(Source) {
            return Source.query().$promise;
          }],
          reports: function() {
            if (!reports) {
              reports = $scope.filterSelected($scope.reports);
            }

            return reports;
          }
        }
      });

      modalInstance.result.then(function(incidentId) {
        var ids = reports.map(function(report) {
          return report._id;
        });
        Report.linkToIncident({ ids: ids, incident: incidentId });
      });
    };
  }
])

.controller('IncidentSelectModalInstanceController', [
  '$rootScope',
  '$scope',
  '$modalInstance',
  'incidents',
  'reports',
  'sources',
  'smtcTags',
  'Report',
  'Tags',
  'Incident',
  'paginationOptions',
  'FlashService',
  function($rootScope, $scope, $modalInstance, incidents, reports, sources, smtcTags, Report, Tags, Incident, paginationOptions, flash) {
    $scope.reports = angular.copy(reports);
    $scope.incidents = incidents.results;
    $scope.sources = sources;
    $scope.sourcesById = {};
    $scope.smtcTags = angular.copy(smtcTags);
    $scope.smtcTagsById = {}
    $scope.modal = $modalInstance;
    $scope._showErrors = false;

    var init = function() {
      $scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});
      $scope.sourcesById = $scope.sources.reduce(groupById, {});
    }

    var groupById = function(memo, item) {
      memo[item._id] = item;
      return memo;
    };

    $scope.select = function(incident) {
      // report._incident = incident._id;
      $modalInstance.close(incident._id);
    };

    $scope.showErrors = function() {
      return $scope._showErrors;
    };

    $scope.save = function(form) {
      if (form.$invalid) {
        $scope._showErrors = true;
        return;
      }

      $modalInstance.close($scope.reports);
    };

    $scope.tagsToString = Tags.tagsToString;

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.pagination = {
      page: 1,
      perPage: paginationOptions.perPage,
      start: 1,
      end: $scope.incidents.length,
      total: incidents.total
    };

    $scope.getPage = function(page) {

      Incident.query({ page: page - 1 }).$promise
        .then(function(incidents) {
          $scope.incidents = incidents.results;
          var perPage = $scope.pagination.perPage;
          var start = (page - 1) * perPage;
          var l = $scope.incidents.length;
          $scope.pagination.start = start + 1;
          $scope.pagination.end = (page - 1) * perPage + l;
          $scope.pagination.page = page;

        });
    };

    $scope.saveReport = function(report) {
      Report.save({ id: report._id }, report, function() {
      }, function() {
        flash.setAlertNow("Sorry, but that report couldn't be saved.");
      });
    };

    $scope.toggleFlagged = function(report) {
      report.flagged = !report.flagged;
      if (report.flagged) {
        report.read = report.flagged;
      }
      $scope.saveReport(report);
    };

    $scope.isFirstPage = function() {
      return $scope.pagination.page === 1;
    };

    $scope.isLastPage = function() {
      return $scope.pagination.end === incidents.total;
    };

    $scope.sourceClass = function(report) {
      // Pick one of the sources that has a media type. For now, it happens that
      // if a report has multiple sources, they all have the same type, or are
      // deleted

      if (report.metadata.platform === "Facebook") {
        // set Facebook as source for CrowdTangle reports
        return 'facebook-source';
      } else {
        for (var i = 0; i < report._sources.length; i++) {
          var sourceId = report._sources[i];
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
