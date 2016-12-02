// Handles CRUD requests for trends.

var express = require('express');
var Trend = require('../../../models/trend');
var Query = require('../../../models/query');
var ReportQuery = require('../../../models/query/report-query');
var _ = require('underscore');
var writelog = require('../../writeLog');

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  app.use(express.urlencoded());
  app.use(express.json());

  var _trendMasterListenerAdded = false;

  // Create a new Trend
  app.post('/api/v1/trend', user.can('manage trends'), function(req, res) {
    // Parse query data
    var queryData = parseQueryData(req.body);
    if (!queryData) return res.send(422);
    Trend.create({ _query: Query.hash(new ReportQuery(queryData)) }, function(err, trend) {
      if (err) return res.send(err.status, err.message);

      if (_trendMasterListenerAdded) {
        var trendBackFillCallback = function(_trend) {
          if (_trend._id.toString() === trend._id.toString()) {
            app.removeListener('trend:backfill', trendBackFillCallback);
            return res.send(200, _trend);
          }
        };
        app.on('trend:backfill', trendBackFillCallback);
      } else {
        return res.send(200, trend.toJSON());
      }
    });
  });

  // Get a list of all Trends
  app.get('/api/v1/trend', user.can('view data'), function(req, res) {
    var page = req.query.page || 1;
    Trend.findPaginatedCounts({}, page, function(err, trends) {
      if (err) res.send(err.status, err.message);
      else {
        writelog.writeTrend(req, 'viewTrends');
        res.send(200, trends);
      }
    });
  });

  // Get a Trend by _id
  app.get('/api/v1/trend/:_id', user.can('view data'), function(req, res) {
    var page = req.query.page || 1;
    Trend.findPageById(req.params._id, page, function(err, trend) {
      if (err) res.send(err.status, err.message);
      else if (!trend) res.send(404);
      else res.send(200, trend.toJSON());
    });
  });

  // Toggle a Trend
  app.put('/api/v1/trend/:_id/:op', user.can('manage trends'), function(req, res, next) {
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
  app.delete('/api/v1/trend/:_id', user.can('manage trends'), function(req, res, next) {
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
  app.delete('/api/v1/trend/_all', user.can('manage trends'), function(req, res) {
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

    // Use an external event emitter to relay status information
  app.addListeners = function(type, emitter) {
    switch (type) {
    case 'trendMaster':
      this._addTrendMasterListeners(emitter);
      break;
    }
  };

  app._addTrendMasterListeners = function(emitter) {
    _trendMasterListenerAdded = true;

    emitter.on('trend:backfill', function(trend) {
      app.emit('trend:backfill', trend);
    });
  };

  return app;
};

// Determine the search keywords
function parseQueryData(data) {
  if (!data) return;

  // Data passed through URL parameters
  return _.pick(data, ['keywords', 'media', 'sourceId', 'incidentId']);
}
