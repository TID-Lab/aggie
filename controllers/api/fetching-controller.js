var express = require('express');
var app = express();

app.get('/api/fetching', function(req, res) {
  app.on('status', function(status) {
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
      return res.send(404);
  }
});

// Use an external event emitter to relay status information
app.statusListener = function(sourceEventEmitter) {
  sourceEventEmitter.on('status', function(status) {
    app.emit('status', status);
  });
};

module.exports = app;
