// Handles CRUD requests for reports.
'use strict';

var express = require('express');
var Report = require('../../../models/report');
var batch = require('../../../models/batch');
var ReportQuery = require('../../../models/query/report-query');
var _ = require('underscore');
var writelog = require('../../writeLog');
var tags = require('../../../shared/tags');
const database = require("../../../lib/database");
var mongoose = database.mongoose;

var client = database.mongoose.connection.client;

module.exports = function (app, user) {
    app = app || express();
    user = user || require('../authorization')(app);

    // Get a list of all Reports
    app.get('/api/v1/report', user.can('view data'), function (req, res) {
        var page = req.query.page;

        // Parse query string
        var queryData = parseQueryData(req.query);
        if (queryData) {
            var query = new ReportQuery(queryData);

            // Query for reports using fti
            Report.queryReports(query, page, function (err, reports) {
                if (err) res.send(err.status, err.message);
                else {
                    writelog.writeReport(req, reports, 'filter', query);
                    res.send(200, reports);
                }
            });
        } else {
            // Return all reports using pagination
            Report.findSortedPage({}, page, function (err, reports) {
                if (err) res.send(err.status, err.message);
                else res.send(200, reports);
            });
        }
    });

    app.get('/api/v1/reportNodes', user.can('view data'), function (req, res) {
        var page = req.query.page;

        // Parse query string
        var queryData = parseQueryData(req.query);
        if (queryData) {
            var query = new ReportQuery(queryData);

            // Query for reports using fti
            // Set page to -1 to get all nodes within the date span
            Report.queryReports(query, -1, async function (err, reports) {
                if (err) res.send(err.status, err.message);
                else {
                    writelog.writeReport(req, reports, 'filter', query);
                    getReportSimScores(res, reports);

                }
            });
        } else {
            // Return all reports using pagination
            Report.findSortedPageAll({}, function (err, reports) {
                if (err) res.send(err.status, err.message);
                else {
                  getReportSimScores(res, reports);
                  //let graphData = createReportGraph(scores);
                  //res.send(200, scores);
                }

            });
        }

        //mongoose.set("debug", (collectionName, method, query, doc) => {
        // console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
        //});

        const getReportSimScores = async function (res,relevantReportIds) {
            var aggie = client.db('aggie');
            var reportSimScores = aggie.collection("reportsimscores");
            // filter reports to just IDs
            let reportIds = relevantReportIds.results.map((report) => mongoose.Types.ObjectId(report.id));

            //var reportIdss = await reportSimScores.find();
            //await reportSimScores.find({"reports": {"$in": reportIds}}).explain().then(console.log);

            // {"reports": {"$in": reportIds}}
            // [mongoose.Types.ObjectId("60797e348e9576014e4084c8"), mongoose.Types.ObjectId("607a661e2ca43923b84af838")]
            let query = await reportSimScores.find({"reports": {"$in": reportIds}}).limit(200).toArray(async function (err, scores) {
                if (err) res.send(err.status, err.message);
                else {
                    //return scores;
                    let graphData = createReportGraph(scores);
                    res.send(200, graphData);

                    //res.send(200, scoresArray);
                }
                return [];
            });
        };

        const createReportGraph = async function (reportSimScores) {

            var aggie = client.db('aggie');
            var reportsCollection = aggie.collection("reports");

            var graphData = {"nodes": [], "links": []};

            var authors = new Set()
            var next_author_id = 0;
            var id_to_author = {};
            var author_to_id = {};

            var observedAuthors = new Set();

            // Get reports with tag
            // let p = new Promise((resolve, reject) => {
            //var actualTag = await smtctagsCollection.findOne({"name": tagObj.name});
            var relatedReports = [];
            //var reports = await reportsCollection.find({"smtcTags": {"$in": [actualTag._id]}}).toArray();

            for (const reportSimScore of reportSimScores) {

                    var taggedReport = await reportsCollection.
                    findOne({"hasSMTCTags": true, "_id": {"$in":
                            reportSimScore["reports"]
                            // .map((idNum) => mongoose.Types.ObjectId(idNum))
                    }});

                    var otherReport = await reportsCollection.findOne({"hasSMTCTags": false, "_id":
                          {"$not": {"$in": [mongoose.Types.ObjectId(taggedReport._id)]}}})

                    if (!authors.has(taggedReport["author"])) {
                        authors.add(taggedReport["author"]);
                        id_to_author[next_author_id] = {
                            "name": taggedReport["author"],
                            "id": next_author_id,
                            "author_type": "taggedAuthor",
                            //"tagCategories": [] // need to add additional tags as they occur
                        };
                        graphData["nodes"].push(id_to_author[next_author_id]);
                        observedAuthors.add(next_author_id);
                        author_to_id[taggedReport["author"]] = next_author_id;
                        next_author_id += 1;
                    }
                        // Add author if necessary
                        if (!authors.has(otherReport["author"])) {
                            authors.add(otherReport["author"]);
                            id_to_author[next_author_id] = {
                                "name": otherReport["author"],
                                "id": next_author_id
                            };
                            graphData["nodes"].push(id_to_author[next_author_id]);
                            observedAuthors.add(next_author_id);
                            author_to_id[otherReport["author"]] = next_author_id;
                            next_author_id += 1;
                        }

                        // Link post to author
                        graphData["links"].push({
                            "source": author_to_id[otherReport["author"]], // the relatedReport author
                            "target": author_to_id[taggedReport["author"]], // taggedReport author
                            "score": reportSimScore["score"] // the simScore
                        });

            }
             return graphData;

        };


    });

    // Load batch
    app.get('/api/v1/report/batch', user.can('view data'), function (req, res) {
        batch.load(req.session.user._id, function (err, reports) {
            if (err) res.send(err.status, err.message);
            else {
                writelog.writeBatch(req, 'loadBatch', reports);
                res.send(200, {results: reports, total: reports.length});
            }
        });
    });

    // Checkout new batch
    app.patch('/api/v1/report/batch', user.can('edit data'), function (req, res) {
        var query = new ReportQuery(req.body);
        batch.checkout(req.session.user._id, query, function (err, reports) {
            if (err) res.send(err.status, err.message);
            else {
                writelog.writeBatch(req, 'getNewBatch', reports);
                res.send(200, {results: reports, total: reports.length});
            }
        });
    });

    // Cancel batch
    app.put('/api/v1/report/batch', user.can('edit data'), function (req, res) {
        batch.cancel(req.session.user._id, function (err) {
            if (err) res.send(err.status, err.message);
            else {
                writelog.writeBatch(req, 'cancelBatch');
                res.send(200);
            }
        });
    });

    // Get Report by id
    app.get('/api/v1/report/:_id', function (req, res) {
        Report.findById(req.params._id, function (err, report) {
            if (err) res.send(err.status, err.message);
            else if (!report) res.send(404);
            else {
                writelog.writeReport(req, report, 'viewReport');
                res.send(200, report);
            }
        });
    });

    // Get Report Comments by id
    app.get('/api/v1/comments/:_id', function (req, res) {
        var page = req.query.page;
        var queryData = {commentTo: req.params._id};
        var query = new ReportQuery(queryData);
        Report.queryReports(query, page, function (err, reports) {
            if (err) res.send(err.status, err.message);
            else {
                writelog.writeReport(req, reports, 'filter', query);
                res.send(200, reports);
            }
        });
    });

    // Update Report data
    app.put('/api/v1/report/:_id', user.can('edit data'), function (req, res) {
        // Find report to update
        Report.findById(req.params._id, function (err, report) {
            if (err) return res.send(err.status, err.message);
            if (!report) return res.send(404);
            // Update the actual value
            _.each(_.pick(req.body, ['_incident', 'read', 'smtcTags', 'notes', 'escalated', 'veracity']), function (val, key) {
                report[key] = val;
            });
            // Save report
            report.save(function (err, numberAffected) {
                if (err) res.send(err.status, err.message);
                else if (!numberAffected) res.send(404);
                else {
                    res.send(200);
                }
            });
        });
    });

    // Delete all reports
    app.delete('/api/v1/report/_all', user.can('edit data'), function (req, res) {
        Report.remove(function (err) {
            if (err) res.send(err.status, err.message);
            else {
                writelog.writeReport(req, {}, 'deleteAllReports');
                res.send(200);
            }
        });
    });

    // Edit veracity selected reports
    app.patch('/api/v1/report/_veracity', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                // Edit veracity to catch it in model
                report.toggleVeracity(req.body.veracity);
                report.save(function (err) {
                    if (err) {
                        if (!res.headersSent) res.send(err.status, err.message)
                        return;
                    }
                    writelog.writeReport(req, report, 'changeVeracityReport');
                    if (--remaining === 0) return res.send(200);
                });
            });
        });
    });

    // Mark selected reports as read
    app.patch('/api/v1/report/_read', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                // Mark each report as read only to catch it in model
                report.toggleRead(req.body.read);
                report.save(function (err) {
                    if (err) {
                        if (!res.headersSent) res.send(err.status, err.message)
                        return;
                    }
                    writelog.writeReport(req, report, 'markAsRead');
                    if (--remaining === 0) return res.send(200);
                });
            });
        });
    });

    // Escalate selected reports
    app.patch('/api/v1/report/_escalate', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                // Mark each report as escalated to catch it in model
                report.toggleEscalated(req.body.escalated);
                report.save(function (err) {
                    if (err) {
                        if (!res.headersSent) res.send(err.status, err.message)
                        return;
                    }
                    writelog.writeReport(req, report, 'escalatedReport');
                    if (--remaining === 0) return res.send(200);
                });
            });
        });
    });

    // Link selected reports to one incident
    app.patch('/api/v1/report/_link', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                report.read = true;
                report._incident = req.body.incident;
                report.save(function (err) {
                    if (err) {
                        if (!res.headersSent) res.send(err.status, err.message)
                        return;
                    }
                    writelog.writeReport(req, report, 'addToIncident');
                    if (--remaining === 0) return res.send(200);
                });
            });
        });
    });

    // Unlink selected reports from an incident
    app.patch('/api/v1/report/_unlink', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                report._incident = null;
                report.save(function (err) {
                    if (err) {
                        if (!res.headersSent) res.send(err.status, err.message)
                        return;
                    }
                    writelog.writeReport(req, report, 'removeFromIncident');
                    if (--remaining === 0) return res.send(200);
                });
            });
        });
    });

    // Update Notes
    app.patch('/api/v1/report/_updateNotes', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                report.notes = req.body.notes;
                report.save(function (err) {
                    if (err) {
                        if (!res.headersSent) res.send(err.status, err.message)
                        return;
                    }
                    writelog.writeReport(req, report, 'addToIncident');
                    if (--remaining === 0) return res.send(200);
                });
            });
        });
    });

    // Update Escalated
    app.patch('/api/v1/report/_updateEscalated', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                report.toggleEscalated(req.body.escalated);
                report.save(function (err) {
                    if (err) {
                        if (!res.headersSent) res.send(err.status, err.message)
                        return;
                    }
                    writelog.writeReport(req, report, 'addToIncident');
                    if (--remaining === 0) return res.send(200);
                });
            });
        });
    });

    app.patch('/api/v1/report/_updateVeracity', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                report.setVeracity(req.body.veracity);
                report.save(function (err) {
                    if (err) {
                        if (!res.headersSent) res.send(err.status, err.message)
                        return;
                    }
                    writelog.writeReport(req, report, 'addToIncident');
                    if (--remaining === 0) return res.send(200);
                });
            });
        });
    });

    app.patch('/api/v1/report/_tag', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                report.read = true;
                report.addSMTCTag(req.body.smtcTag, (err) => {
                    if (err && !res.headersSent) {
                        res.send(500, err.message);
                        return;
                    }
                    report.save(function (err) {
                        if (err) return res.send(err.status, err.message);
                        writelog.writeReport(req, report, 'addTagToReport');
                        if (--remaining === 0) return res.send(200);
                    });
                });
            });
        });
    });

    app.patch('/api/v1/report/_untag', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                report.removeSMTCTag(req.body.smtcTag, (err) => {
                    if (err && !res.headersSent) {
                        res.send(500, err.message);
                        return;
                    }
                    report.save(function (err) {
                        if (err) return res.send(err.status, err.message);
                        writelog.writeReport(req, report, 'removeTagFromReport');
                        if (--remaining === 0) return res.send(200);
                    });
                });
            });
        });
    });

    app.patch('/api/v1/report/_clearTags', user.can('edit data'), function (req, res) {
        if (!req.body.ids || !req.body.ids.length) return res.send(200);
        Report.find({_id: {$in: req.body.ids}}, function (err, reports) {
            if (err) return res.send(err.status, err.message);
            if (reports.length === 0) return res.send(200);
            var remaining = reports.length;
            reports.forEach(function (report) {
                report.clearSMTCTags(() => {
                    report.save(function (err) {
                        if (err) {
                            if (!res.headersSent) res.send(err.status, err.message)
                            return;
                        }
                        writelog.writeReport(req, report, 'clearTagsFromReport');
                        if (--remaining === 0) return res.send(200);
                    });
                });
            });
        });
    });

    return app;
};

// Determine the search keywords
function parseQueryData(queryString) {
    if (!queryString) return {};
    // Data passed through URL parameters
    var query = _.pick(queryString, ['keywords', 'status', 'after', 'before', 'media',
        'sourceId', 'incidentId', 'author', 'tags', 'list', 'escalated', 'veracity', 'isRelevantReports']);
    if (query.tags) query.tags = tags.toArray(query.tags);
    return query;
}
