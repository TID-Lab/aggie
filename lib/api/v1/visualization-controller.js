// Handles CRUD requests for reports.
"use strict";

var express = require("express");
var Report = require("../../../models/report");
var Incident = require("../../../models/incident");
var _ = require("underscore");
var writelog = require("../../writeLog");
var tags = require("../../../shared/tags");
var ReportQuery = require("../../../models/query/report-query");

module.exports = function (app, user) {
	app = app || express();
	// user = user || require("../authorization")(app);

	function fixTitle(title) {
		if (title === "dangerous  Speech") {
			return ["dangerous speech"];
		} else if (title === "dis information") {
			return ["disinformation"];
		} else if (title === "disinformation/dangerous speech") {
			return ["dangerous speech", "disinformation"];
		} else if (title === "ppcoc violation disinformation") {
			return ["ppcoc violation", "disinformation"];
		} else if (title === "disinformati") {
			return ["disinformation"];
		} else if (title === "disinfo") {
			return ["disinformation"];
		} else if (title === "ppcoc  violation") {
			return ["ppcoc violation"];
		} else if (title === "election ppcoc violation") {
			return ["ppcoc violation"];
		} else if (title === "dangerous") {
			return ["dangerous speech"];
		} else if (title === "dangerous  speech") {
			return ["dangerous speech"];
		} else if (title === "disinformaiton") {
			return ["disinformation"];
		} else if (title === "disformation") {
			return ["disinformation"];
		} else if (title === "ppcoc") {
			return ["ppcoc violation"];
		} else if (title === "eg disinformation") {
			return ["disinformation"];
		} else if (title === "ppcoco violation") {
			return ["ppcoc violation"];
		} else if (title === "covid19 coc") {
			return ["covid-19"];
		} else if (title === "covid-19 and election") {
			return ["covid-19"];
		} else if (title === "harassmentofwomen") {
			return ["harassment"];
		} else if (title === "covid-19 violation") {
			return ["covid-19"];
		} else if (title === "myanmar hard talks") {
			return ["myanmar hard talk"];
		} else if (title === "covid-19 and election") {
			return ["covid-19"];
		} else if (title === "possible disinformation") {
			return ["disinformation"];
		} else if (title === "no vote (pyae sone review)") {
			return ["no vote"];
		} else if (title === "danspeech") {
			return ["dangerous speech"];
		} else if (title === "disinformaiton hatespeech") {
			return ["disinformaiton", "hate speech"];
		} else if (title === "hatespeech") {
			return ["hate speech"];
		} else if (title === "hatespech") {
			return ["hate speech"];
		} else if (title === "pp coc violation") {
			return ["ppcoc violation"];
		} else return [title];
	}
	app.get("/api/v1/viz", function (req, res) {
		Incident.find({}, function (err, incidents) {
			if (err) {
				res.send(err.status, err.message);
				return;
			}
			Report.find({ _incident: {$nin: [null, ""]} }, function (err, reports) {
				if (err) res.send(err.status, err.message);
				else res.send(200, { incidents: incidents, reports: reports });
			});

			// var count = req.query.count;
			// if (count) delete req.query.count;
			// var query = new ReportQuery(Object.assign(req.query));
			// if (count) {
			// 	Report.find(query.toMongooseFilter(), function (err, reports) {
			// 		if (err) res.send(err.status, err.message);
			// 		else {
			// 			var fixed = reports.map(function (report) {
			// 				var fixed = Object.assign({}, report._doc, { _media: report._doc._media[0] });
			// 				return fixed;
			// 			});
			// 			res.send(200, { incidents: incidents, reports: fixed });
			// 		}
			// 	}).limit(parseInt(count));
			// } else {
			// 	Report.find(query.toMongooseFilter(), function (err, reports) {
			// 		if (err) res.send(err.status, err.message);
			// 		else {
			// 			var fixed = reports.map(function (report) {
			// 				var fixed = Object.assign({}, report._doc, { _media: report._doc._media[0] });
			// 				return fixed;
			// 			});
			// 			res.send(200, { incidents: incidents, reports: fixed });
			// 		}
			// 	});
			// }
		});
	});
};
