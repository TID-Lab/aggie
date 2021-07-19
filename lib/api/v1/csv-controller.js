// Handles CRUD requests for reports.
"use strict";

var express = require("express");
var Report = require("../../../models/report");
var _ = require("underscore");
var writelog = require("../../writeLog");
var tags = require("../../../shared/tags");
var ReportQuery = require("../../../models/query/report-query");

module.exports = function (app, user) {
  app = app || express();
  user = user || require("../authorization")(app);

  app.get("/api/v1/csv", async function (req, res) {
    var filter;
    if (Object.keys(req.query).length === 0) {
      var endDate = new Date();
      var startDate = new Date();
      startDate.setTime(startDate.getTime() - 2 * (24 * 60 * 60 * 1000));
      filter = { storedAt: { $lte: endDate, $gte: startDate } };
    }
    else filter = { storedAt: { $lte: new Date(req.query.before), $gte: new Date(req.query.after) } };
    var reports = await Report.find(filter, function (err, reports) {
      if (err) {
        res.send(err.status, err.message);
        return [];
      }
      return reports;
    });
    
    
    
    res.send(200, { reports: reports });
  });
};

