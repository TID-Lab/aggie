// Handles requests for enabling or disabling fetching.

var express = require('express');
var app = express();
var auth = require('../authentication')(app);
var user = require('../authorization')(app, auth);
var logger = require('../../logger');

app.get('/api/v1/fetching', user.can('view data'), function(req, res) {
  var config = require('../../../config/secrets');
  var fetching = config.get().fetching;
  res.send(200, {enabled: fetching});
});

// Enable/disable global fetching
app.put('/api/v1/fetching/:op', user.can('toggle fetching'), function(req, res) {
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
  var config = require('../../../config/secrets');
  config.updateFetching(fetching, function(err){
    if (err) {
      logger.error(err);
      res.send(500);
    }

    var signal = fetching ? 'fetching:start' : 'fetching:stop';
    app.emit(signal);
    
    return res.send(200);
  });
});

module.exports = app;
