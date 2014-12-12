// Handles requests for enabling or disabling fetching.

var express = require('express');
var app = express();
var auth = require('../authentication')(app);
var user = require('../authorization')(app, auth);

app.get('/api/v1/fetching', user.can('view data'), function(req, res) {
  app.getStatus(function(status) {
    res.send(200, status);
  });
});

// Enable/disable global fetching
app.put('/api/v1/fetching/:op', user.can('toggle fetching'), function(req, res) {
  switch(req.params.op) {
    case 'on':
      app.emit('fetching:start');
      return res.send(200);
    case 'off':
      app.emit('fetching:stop');
      return res.send(200);
    default:
      return res.send(404);
  }
});

// Use an external event emitter to relay status information
app.addListeners = function(type, emitter) {
  switch (type) {
    case 'botMaster':
      this._addBotMasterListeners(emitter);
      break;
  }
};

app.getStatus = function(callback) {
  app.once('status', function(status) {
    callback({enabled: status});
  });
  app.emit('fetching:getStatus');
};

app._addBotMasterListeners = function(emitter) {
  emitter.on('botMaster:status', function(status) {
    app.emit('status', status.enabled);
  });
  // Initialize by sending status
  app.getStatus(function(status) {
    app.emit('status', status.enabled);
  });
};

module.exports = app;
