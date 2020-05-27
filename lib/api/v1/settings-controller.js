// Handles requests for manipulating app settings
'use strict';

var express = require('express');
var app = express();
var auth = require('../authentication')(app);
var user = require('../authorization')(app, auth);
var config = require('../../../config/secrets');
var test = require('../../fetching/content-services/test-content-services');

// Enable/disable global fetching
app.put('/api/v1/settings/fetching/:op', user.can('change settings'), function(req, res) {
  var fetching = null;
  switch (req.params.op) {
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
      return res.send(500);
    }

    app.emit(fetching ? 'fetching:start' : 'fetching:stop');

    res.send(200);
  });

});

// Get Google Places API Key. Remember to set it so that only certain domains can use it
app.get('/api/v1/settings/gplaces', function(req, res) {
  var result = {};
  result.gplaces = config.get()['gplaces'];
  result.setting = 'gplaces';
  res.send(200, result);
});

// Get any setting
app.get('/api/v1/settings/:setting', user.can('change settings'), function(req, res) {
  var result = {};
  result[req.params.setting] = config.get({ reload: true })[req.params.setting];
  result.setting = req.params.setting;
  res.send(200, result);
});

// Modify setting
app.put('/api/v1/settings/:entry', user.can('change settings'), function(req, res) {
  config.update(req.params.entry, req.body.settings, function(err) {
    if (err) {
      return res.send(500);
    }
    // Updating settings may require to reload or reset bots or other modules
    app.emit('settingsUpdated', { setting: req.params.entry });
    res.send(200);
  });
});

// We use post to test the media settings with the service provider but not to save
app.post('/api/v1/settings/media/:media/test', user.can('change settings'), function(req, res) {
  test.testContentService(req.params.media, req.body.settings, function(err, data, response) {
    if (err) {
      return res.status(200).send({ success: false, message: err.message });
    }

    res.status(200).send({ success: true });
  });
});

// Clear setting
app.delete('/api/v1/settings/:entry', user.can('change settings'), function(req, res) {
  config.clear(req.params.entry, function(err) {
    if (err) {
      res.send(500);
    }

    res.send(200);
  });
});

module.exports = app;
