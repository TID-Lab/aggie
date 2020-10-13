// Handles CRUD requests for reports.
'use strict';

var express = require('express');
var Report = require('../../../models/report');
var _ = require('underscore');
var writelog = require('../../writeLog');
var tags = require('../../../shared/tags');
var ReportQuery = require('../../../models/query/report-query');

module.exports = function(app, user) {
  app = app || express();
  
  // Get a list of all Reports
  app.get('/api/v1/viz', function(req, res) {
    var filterResults = {
			_id: 1,
			authoredAt: 1,
			author: 1,
			tags: 1,
			flagged: 1,
			_media: 1,
			"metadata.ct_tag": 1,
			"metadata.actualStatistics": 1,
			"metadata.expectedStatistics": 1,
			"metadata.rawAPIResponse.score": 1,
			read: 1,
		};
    var count = req.query.count;
    if (count) delete req.query.count;
		var query = new ReportQuery(Object.assign(req.query, { status: "Read" }));
		console.log(query);
    if (count){
      Report.find(query.toMongooseFilter(), filterResults, function(err, reports) {
        if (err) res.send(err.status, err.message);
        else res.send(200, reports.map(function (report) {
          var fixed = Object.assign({}, report._doc, {_media: report._doc._media[0]});
          if (fixed.metadata.expectedStatistics || fixed.metadata.actualStatistics) {
            var expected = JSON.parse(JSON.stringify(fixed.metadata.expectedStatistics).replace(/(")(.*?")/g, "$1expected_$2"))
            var actual = JSON.parse(JSON.stringify(fixed.metadata.actualStatistics).replace(/(")(.*?")/g, "$1actual_$2"))
            fixed = Object.assign(fixed, expected, actual);
            delete fixed.metadata.actualStatistics;
            delete fixed.metadata.expectedStatistics;
          }
          if (fixed.metadata.rawAPIResponse) {
            fixed = Object.assign(fixed, {score: fixed.metadata.rawAPIResponse.score})
            delete fixed.metadata.rawAPIResponse;
          }
          return fixed;
        }))
      }).limit(parseInt(count));
    } else {
      Report.find(query.toMongooseFilter(), filterResults, function(err, reports) {
        if (err) res.send(err.status, err.message);
        else res.send(200, reports.map(function (report) {
          return Object.assign({}, report._doc, {_media: report._doc._media[0]})
        }))
      })
    }
  });


  // Get Report by id
  app.get('/api/v1/test/:_id', function(req, res) {
    Report.findById(req.params._id, function(err, report) {
      if (err) res.send(err.status, err.message);
      else if (!report) res.send(404);
      else {
        writelog.writeReport(req, report, 'viewReport');
        res.send(200, report);
      }
    });
  });

  return app;
};

// Determine the search keywords
function parseQueryData(queryString) {
  if (!queryString) return {};
  // Data passed through URL parameters
  var query = _.pick(queryString, ['keywords', 'status', 'after', 'before', 'media',
                                   'sourceId', 'incidentId', 'author', 'tags', 'list']);
  if (query.tags) query.tags = tags.toArray(query.tags);
  return query;
}
