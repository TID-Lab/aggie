var express = require('express');
var Trend = require('../../../models/trend');
var Query = require('../../../models/query');
var _ = require('underscore');

module.exports = function(app) {
  app = app || express();
  app.use(express.bodyParser());

  // Create a new Trend
  app.post('/api/v1/trend', function(req, res) {
    // Parse query data
    var queryData = parseQueryData(req.body);
    if (!queryData || !queryData.keywords) return res.send(422);
    Trend.create({_query: Query.hash(queryData)}, function(err, trend) {
      if (err) res.send(err.status, err.message);
      else res.send(200, trend.toJSON());
    });
  });

  // Get a list of all Trends
  app.get('/api/v1/trend', function(req, res) {
    Trend.find(null, '-counts', {lean: true}, function(err, trends) {
      if (err) res.send(err.status, err.message);
      else res.send(200, trends);
    });
  });

  // Get a Trend by _id
  app.get('/api/v1/trend/:_id', function(req, res) {
    var page = req.query.page || 0;
    Trend.findPageById(req.params._id, page, function(err, trend) {
      if (err) res.send(err.status, err.message);
      else if (!trend) res.send(404);
      else res.send(200, trend.toJSON());
    });
  });

  // Toggle a Trend
  app.put('/api/v1/trend/:_id/:op', function(req, res, next) {
    // Find a trend to enable/disable
    Trend.findById(req.params._id, function(err, trend) {
      if (err) return res.send(err.status, err.message);
      if (!trend) return res.send(404);
      // Set `enabled` value
      switch (req.params.op) {
        case 'enable':
        case 'disable':
          trend.toggle(req.params.op, function(err) {
            if (err) res.send(err.status, err.message);
            else res.send(200);
          });
          break;
        default:
          res.send(422);
      }
    });
  });

  // Delete a Trend
  app.delete('/api/v1/trend/:_id', function(req, res, next) {
    if (req.params._id === '_all') return next();
    Trend.findById(req.params._id, function(err, trend) {
      if (err) return res.send(err.status, err.message);
      if (!trend) return res.send(404);
      trend.remove(function(err) {
        if (err) return res.send(err.status, err.message);
        res.send(200);
      });
    });
  });

  // Delete all Trends
  app.delete('/api/v1/trend/_all', function(req, res) {
    Trend.find(function(err, trends) {
      if (err) return res.send(err.status, err.message);
      if (trends.length === 0) return res.send(200);
      var remaining = trends.length;
      trends.forEach(function(trend) {
        // Delete each trend explicitly to catch it in model
        trend.remove(function(err) {
          if (err) return res.send(err.status, err.message);
          if (--remaining === 0) return res.send(200);
        });
      });
    });
  });

  return app;
};

// Determine the search keywords
function parseQueryData(data) {
  if (!data) return;

  // Data passed through URL parameters
  if (data.hasOwnProperty('keywords')) {
    return _.extend({type: 'Trend'}, _.pick(data, ['keywords', 'sourceType', 'sourceId', 'incidentId']));
  }
}
