// Handles CRUD requests for reports.
"use strict";

const Report = require("../../models/report");

exports.csv_csv = async (req, res) => {
  var filter;
  if (Object.keys(req.query).length === 0) {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setTime(startDate.getTime() - 2 * (24 * 60 * 60 * 1000));
    filter = { storedAt: { $lte: endDate, $gte: startDate } };
  }
  else filter = { storedAt: { $lte: new Date(req.query.before), $gte: new Date(req.query.after) } };
  var reports = await Report.find(filter, (err, reports) => {
    if (err) {
      res.status(err.status).send(err.message);
      return [];
    }
    return reports;
  });
  res.status(200).send({ reports: reports });
};

