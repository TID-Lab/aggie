// Handles public endpoints. Used in Public Map widget
'use strict';

var express = require('express');
var app = express();
var Incident = require('../../../models/incident');

// Get a list of all public Incidents with only the public fields
app.get('/api/v1/public/incident', function(req, res) {

  Incident.find({ public: true }, {
    _id: 0,
    latitude: 1,
    longitude: 1,
    veracity: 1,
    locationName: 1,
    title: 1,
    status: 1,
    public: 1,
    publicDescription: 1
  }, function(err, incidents) {
    if (err) res.send(err.status, err.message);
    else res.send(200, incidents);
  });
});

module.exports = app;

