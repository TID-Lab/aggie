var _ = require("lodash");
var renderReportGraph = require("./report-graph");
var renderHateSpeechReportGraph = require("./alg-hate-speech-graph");
var renderHateSpeechActualReportGraph = require("./tagged-hate-speech-graph");
var renderSourceBar = require("./source-bar");
var fixTitle = require("./incident-preprocess");
angular
  .module("Aggie")

  .controller("AnalysisController", [
    "$scope",
    "Socket",
    "data",
    "smtcTags",
    "threshold",
    "Settings",
    function ($scope, Socket, data, smtcTags, threshold, Settings) {
      $scope.hateSpeechThreshold = threshold.hateSpeechThreshold;

      var endDate = new Date();
      var startDate = new Date();
      startDate.setTime(startDate.getTime() - 2 * (24 * 60 * 60 * 1000));
      var parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

      $scope.reports = data.reports
        .map(function (e) {
          var out = Object.assign({}, e);
          out.authoredAt = parseTime(out.authoredAt);
          out.authoredAt.setMinutes(0, 0, 0);
          return out;
        })
        .filter(function (report) {
          return (
            report.authoredAt.getTime() >= startDate.getTime() &&
            report.authoredAt.getTime() <= endDate.getTime()
          );
        });

      $scope.sources = $scope.reports.reduce(function (acc, report) {
        // if (!report.metadata.ct_tag) return acc;
        if (!report.metadata.ct_tag) acc["Other"] = acc["Other"] ? acc["Other"] + 1 : 1;
        else
          acc[report.metadata.ct_tag] = acc[report.metadata.ct_tag]
            ? acc[report.metadata.ct_tag] + 1
            : 1;
        return acc;
      }, {});
      $scope.numSources = Object.keys($scope.sources).length;

      $scope.incidents = data.incidents.map(function (incident) {
        var tags = incident.title
          .split(",")
          .map(function (title) {
            var normalized = title.replace(/^\s+|\s+$/g, "").toLowerCase();
            return fixTitle(normalized);
          })
          .flat();
        return Object.assign({}, incident, { titleTags: tags });
      });

      $scope.incidentReports = data.incidentReports
        .map(function (report) {
          var out = Object.assign({}, report);
          out.authoredAt = parseTime(out.authoredAt);
          out.authoredAt.setMinutes(0, 0, 0);
          if (out._incident) {
            out._incident = $scope.incidents.find(function (incident) {
              return incident._id === out._incident;
            });
          }
          return out;
        })
        .filter(function (report) {
          console.log(report);
          return report._incident.titleTags.includes("hate speech");
        });

      var incidentReportData = d3.timeHour.range(startDate, endDate).map(function (d) {
        d.setMinutes(0, 0, 0);
        var intTime = d.getTime();
        return {
          date: d,
          value: $scope.incidentReports.filter(function (report) {
            return report.authoredAt.getTime() === intTime;
          }).length,
        };
      });
      $scope.algHateSpeech = $scope.reports.filter(function (report) {
        return report.metadata.hateSpeechScore > $scope.hateSpeechThreshold;
      });
      $scope.hateSpeechReportsData = d3.timeHour.range(startDate, endDate).map(function (d) {
        d.setMinutes(0, 0, 0);
        var intTime = d.getTime();
        return {
          date: d,
          value: $scope.algHateSpeech.filter(function (report) {
            return report.authoredAt.getTime() === intTime;
          }).length,
        };
      });
      $scope.range = [
        0,
        Math.max(
          d3.max(incidentReportData, function (d) {
            return d.value;
          }),
          d3.max($scope.hateSpeechReportsData, function (d) {
            return d.value;
          })
        ),
      ];

      var init = function () {
        Socket.on("stats", updateStats);
        Socket.join("stats");
        renderReportGraph(
          "#reports",
          $scope.reports,
          startDate,
          endDate,
          "Reports in last 48 hours"
        );
      };

      var updateStats = function (stats) {
        $scope.stats = stats;
      };

      $scope.$on("$destroy", function () {
        Socket.leave("stats");
        Socket.removeAllListeners("stats");
      });

      $scope.initIncidentGraph = function () {
        renderHateSpeechActualReportGraph(
          "#reports-hs-actual",
          incidentReportData,
          $scope.range,
          "Hate speech identified by trackers"
        );
      };

      $scope.initHateSpeechGraph = function () {
        renderHateSpeechReportGraph(
          "#reports-hs",
          $scope.hateSpeechReportsData,
          $scope.range,
          "Probable problematic speech identified by algorithm"
        );
      };

      $scope.initSourceBar = function () {
        renderSourceBar(
          "#sources",
          $scope.sources,
          $scope.reports.length,
          "Facebook source breakdown"
        );
      };

      init();
    },
  ]);
