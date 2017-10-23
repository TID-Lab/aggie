// Handles public endpoints. Used in Public Map widget
'use strict';

var express = require('express');
var Incident = require('../../../models/incident');
var config = require('../../../config/secrets');

module.exports = function(app) {
  app = app || express();

  app.use(express.urlencoded());
  app.use(express.json());

  // Get a list of all public Incidents with only the public fields
  app.get('/api/v1/public/incident', function(req, res) {
    // TODO: Gather public field requirements
    Incident.find({ tags: { $all: ['public'] } }, {
      _id: 0,
      latitude: 1,
      longitude: 1,
      veracity: 1,
      locationName: 1,
      title: 1,
      status: 1,
      tags: 1 }, function(err, incidents) {
        if (err) res.send(err.status, err.message);
        else res.send(200, incidents);
      });
  });
  // Get Google Places API Key. Remember to set it so that only certain domains can use it
  app.get('/api/v1/public/settings/gplaces', function(req, res) {
    var result = {};
    result.gplaces = config.get()['gplaces'];
    result.setting = 'gplaces';
    res.send(200, result);
  });

};
