// Handles CRUD requests for reports.
"use strict";

const express = require("express");
const Report = require("../../models/report");

module.exports = function (app, user) {
  app = app || express();
  user = user || require("../authorization")(app);

  app.get("/api/csv", async function (req, res) {
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

