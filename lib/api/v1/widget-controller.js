// Handles rendering of public widgets
'use strict';

var express = require('express');
var config = require('../../../config/secrets');
var ejs = require('ejs');
var path = require('path');

module.exports = function(app) {
  if (!app) { // app created only for backend testing
    app = express();
    app.engine('html', ejs.renderFile);
    app.set('views', path.join(__dirname, '/../../../public/angular'));
  }

  app.get('/widget/public_incident_map.html', function(req, res) {
    var gPlaces = config.get().gplaces;
    var map = config.get()['incident map'];
    res.render('widget/public_incident_map.html', { gPlaces: gPlaces, map: map });
  });

  return app;
};
