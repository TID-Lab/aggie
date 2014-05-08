var express = require('express');
var app = express();
var auth = require('../authentication')(app);
var user = require('../authorization')(app, auth);

app.get('/api/v1/fetching', user.can('view data'), function(req, res) {
  app.once('status', function(status) {
    res.send(200, {enabled: status});
  });
  app.emit('getStatus');
});

// Enable/disable global fetching
app.put('/api/v1/fetching/:op', user.can('toggle fetching'), function(req, res) {
  switch(req.params.op) {
    case 'on':
      app.emit('start');
      return res.send(200);
    case 'off':
      app.emit('stop');
      return res.send(200);
    default:
      return res.send(404, err.message);
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

app._addBotMasterListeners = function(emitter) {
  emitter.on('status', function(status) {
    app.emit('status', status.enabled);
  });
};

module.exports = app;
