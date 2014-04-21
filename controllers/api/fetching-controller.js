var express = require('express');
var app = express();
var error = require('../error');

app.get('/api/fetching', function(req, res) {
  app.once('status', function(status) {
    res.send(200, {enabled: status});
  });
  app.emit('getStatus');
});

// Enable/disable global fetching
app.put('/api/fetching/:op', function(req, res) {
  switch(req.params.op) {
    case 'on':
      app.emit('start');
      return res.send(200);
    case 'off':
      app.emit('stop');
      return res.send(200);
    default:
      return error.send(res, 404);
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
