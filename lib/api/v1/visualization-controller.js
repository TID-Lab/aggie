// Handles CRUD requests for reports.
"use strict";

var express = require("express");

var database = require('../../../lib/database');
var client = database.mongoose.connection.client;

module.exports = function (app, user) {
  app = app || express();
  user = user || require("../authorization")(app);

  app.get("/api/v1/viz", async function (req, res) {
    var aggie = client.db('aggie');

    var data = {}

    // Authors Visualization
    var authorCollection = aggie.collection('authorVisualization');
    data.authors = await authorCollection.find({}).sort({'reportCount': -1}).limit(50).toArray();

    // Media Visualization
    var mediaCollection = aggie.collection('mediaVisualization');
    data.media = await mediaCollection.find({}).sort({'count': -1}).toArray();
    
    // Tag Visualization
    var tagCollection = aggie.collection('tagVisualization');
    data.tags = await tagCollection.find({}).toArray();    

    // Word cloud Visualization
    var wordCollection = aggie.collection('wordVisualization');
    data.words = await wordCollection.find({}).sort({'count': -1}).limit(200).toArray();

    // Time Visualization
    var timeCollection = aggie.collection('timeVisualization');
    data.time = await timeCollection.find({}).toArray();
    
    // Send Data
    res.send(200, data);
  });
};
