//exposes the ct
'use strict';

var express = require('express');
var tags = require('../../../shared/tags');
var fs = require('fs');
var path = require('path');

module.exports = function(app, user) {
  app = app || express();
  user = user || require('../authorization')(app);

  app.get('/api/ctlists', function(req, res) {
    let ctLists;

    try {
      const filePath = path.resolve(__dirname, '../../../config/crowdtangle_list.json');
      ctLists = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
      ctLists = {};
    }

    res.header("Content-Type",'application/json');
    res.send(200, { lists: ctLists });
  });
}