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
  app.get('/api/v1/test', function(req, res) {
    var filterResults = { 
      _id: 1,
      authoredAt: 1,
      author: 1,
      tags: 1,
      flagged: 1,
      _media: 1,
      "metadata.ct_tag": 1
    };
    var count = req.query.count;
    if (count) delete req.query.count;
    var query = new ReportQuery(req.query);
    if (count){
      Report.find(query.toMongooseFilter(), filterResults, function(err, reports) {
        if (err) res.send(err.status, err.message);
        else res.send(200, reports.map(function (report) {
          return Object.assign({}, report._doc, {_media: report._doc._media[0]})
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
