// Handles public endpoints. Used in Public Map widget
'use strict';

var express = require('express');
var app = express();
var Group = require('../../models/group');

// Get a list of all public Groups with only the public fields
app.get('/api/public/group', function(req, res) {

  Group.find({ public: true }, {
    _id: 0,
    latitude: 1,
    longitude: 1,
    veracity: 1,
    locationName: 1,
    title: 1,
    status: 1,
    public: 1,
    publicDescription: 1
  }, function(err, groups) {
    if (err) res.send(err.status, err.message);
    else res.send(200, groups);
  });
});

module.exports = app;

