// Handles requests for manipulating app settings

var express = require('express');
var app = express();
var auth = require('../authentication')(app);
var user = require('../authorization')(app, auth);
var logger = require('../../logger');
var config = require('../../../config/secrets');

// Get any setting
app.get('/api/v1/settings/:setting', user.can('view data'), function(req, res) {
  res.send(200, {enabled: config.get()[req.params.setting]});
});

// Enable/disable global fetching
app.put('/api/v1/settings/fetching/:op', user.can('toggle fetching'), function(req, res) {
  var fetching = null;
  switch(req.params.op) {
    case 'on':
      fetching = true;
      break;
    case 'off':
      fetching = false;
      break;
    default:
      return res.send(404);
  }

  // save fetching status
  config.updateFetching(fetching, function(err) {
    if (err) {
      logger.error(err);
      res.send(500);
    }

    app.emit(fetching ? 'fetching:start' : 'fetching:stop');

    return res.send(200);
  });

});

module.exports = app;
