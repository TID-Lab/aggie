angular.module('Aggie')

  .controller('ReportsShowController', [
    '$rootScope',
    '$state',
    '$scope',
    '$stateParams',
    '$window',
    'mediaOptions',
    'FlashService',
    'data',
    'incidents',
    'Report',
    'Incident',
    'incidents',
    'Tags',
    'smtcTags',
    'comments',
    'Socket',
    'Queue',
    'sources',
    'paginationOptions',
    '$translate',
    function($rootScope, $state, $scope, $stateParams, $window, mediaOptions, flash, data, incidents, Report, Incident,
             incidents, Tags, smtcTags, comments, Socket, Queue, sources, paginationOptions,  $translate) {
      $scope.incidents = incidents.results;
      $scope.incidentsById = {};
      $scope.currentPath = $rootScope.$state.current.name;
      $scope.smtcTags = smtcTags;
      $scope.smtcTagsById = {};
      $scope.comments = comments.results;
      $scope.visibleComments = new Queue(paginationOptions.perPage);
      $scope.sources = sources;
      $scope.sourcesById = {};
      $scope.pagination = {
        page: parseInt($stateParams.page) || 1,
        total: comments.total,
        visibleTotal: comments.total,
        perPage: paginationOptions.perPage,
        start: 0,
        end: 0
      };

      var init = function() {
        $scope.commentsById = $scope.comments.reduce(groupById, {});
        $scope.sourcesById = $scope.sources.reduce(groupById, {});
        $scope.incidentsById = $scope.incidents.reduce(groupById, {});
        $scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});

        Socket.on('stats', updateStats);
        Socket.join('stats');
        if ($scope.currentPath === 'report') {
          Socket.join('reports');
          Socket.on('report:updated', $scope.updateReport.bind($scope));
        }
        var visibleComments = paginate($scope.comments);
        $scope.visibleComments.addMany(visibleComments);

      };
      var updateStats = function(stats) {
        $scope.stats = stats;
      };

      /**
       * Saves a front-end report to the back end.
       * @param {Report} report
       */
      $scope.saveReport = function(report) {
        Report.save({ id: report._id }, report, function() {
        }, function() {
          flash.setAlertNow("Sorry, but that report couldn't be saved.");
        });
      };

      var paginate = function(items) {
        var page = $scope.pagination.page,
          perPage = $scope.pagination.perPage,
          total = $scope.pagination.total,
          start = (page - 1) * perPage,
          end = page * perPage - 1;

        $scope.pagination.start = Math.min(start + 1, total);
        $scope.pagination.end = Math.min(end + 1, total);

        return items;
      };


      var groupById = function(memo, item) {
        memo[item._id] = item;
        return memo;
      };

      var paginate = function(items) {
        var page = $scope.pagination.page,
          perPage = $scope.pagination.perPage,
          total = $scope.pagination.total,
          start = (page - 1) * perPage,
          end = page * perPage - 1;

        $scope.pagination.start = Math.min(start + 1, total);
        $scope.pagination.end = Math.min(end + 1, total);

        return items;
      };

      $scope.report = data.report;
      $scope.sources = data.sources;

      $scope.isFlagged = function(report) {
        return report.flagged;
      };
      $scope.unlinkIncident = function() {
        $scope.report._incident = '';
        Report.update({ id: $scope.report._id }, $scope.report);
      };

      $scope.markAsRead = function (report) {
        if (report.read) return;
        report.read = true;
        Report.save({id: report._id}, report);
      };

      $scope.tagsToString = Tags.tagsToString;
      $scope.markAsRead(data.report);

      $scope.updateReport = function(report) {
        angular.extend($scope.report, report);
        if (!$scope.incidentsById[report._incident]) {
          Incident.get({ id: report._incident }, function(inc) {
            incidents.results.push(inc);
            $scope.incidentsById[report._incident] = inc;
          });
        }
      };

      $scope.isFirstPage = function() {
        return $scope.pagination.page == 1;
      };

      $scope.isLastPage = function() {
        return $scope.pagination.end >= $scope.pagination.visibleTotal;
      };

      $scope.unlinkIncident = function(report) {
        report._incident = '';
        Report.update({ id: report._id }, report);
      };

      /**
       * Toggles a report's flagged property and sets its read property to true
       * @param {Report} report
       */
      $scope.toggleFlaggedComment = function(report) {
        report.flagged = !report.flagged;
        if (report.flagged) {
          report.read = report.flagged;
        }
        $scope.saveReport(report);
      };

      $scope.saveFlaggedReport = function(report) {
        Report.save({ id: report._id }, report, function() {
        }, function() {
          flash.setAlertNow("Sorry, but that report couldn't be flagged/unflagged.");
        });
      };

      $scope.toggleFlagged = function(flagged) {
        $scope.report.flagged = flagged;
        Report.toggleFlagged({ ids: $scope.report._id, flagged: flagged });
      };

      $scope.isRead = function(report) {
        return report.read;
      };

      $scope.$back = function() {
        $window.history.back();
      };
      $scope.$on('$destroy', function() {
        Socket.leave('stats');
        Socket.removeAllListeners('stats');
      });

      $scope.$on('$destroy', function() {
        Socket.leave('reports');
        Socket.removeAllListeners('reports');
        Socket.leave('stats');
        Socket.removeAllListeners('stats');
      });

      init();
    }
  ]);

// This module is for trusting crowdtangle media content so it can be displayed
// Unless crowdtangle's api returns a url for something that is untrustworthy, this shouldn't post a security risk
angular.module('Aggie')

  .filter('trusted', ['$sce', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  }]);
