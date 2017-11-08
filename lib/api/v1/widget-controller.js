// Handles rendering of public widgets
'use strict';

var express = require('express');
var config = require('../../../config/secrets');



module.exports = function(app) {
  app = app || express();

  app.get('/widget/public_incident_map.html', function(req, res) {
    var gPlaces = config.get().gplaces;
    var map = config.get()['incident map'];
    res.render('widget/public_incident_map.html', { gPlaces: gPlaces, map: map });
  });
};
