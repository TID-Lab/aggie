// Handles CRUD requests for reports.
"use strict";

var express = require("express");
var Report = require('../../../models/report');
var ReportSimScore = require('../../../models/report_sim_scores');
var database = require('../../../lib/database');
var async = require("async");
const SocialGraph = require("../../../models/graph");

var client = database.mongoose.connection.client;


module.exports = function (app, user) {
    app = app || express();
    user = user || require("../authorization")(app);

    // Get a list of all graphs
    app.get('/api/v1/graphs', user.can('view data'), async function (req, res) {
        /*SocialGraph.find({}, function(err, graphs) {
            if (err) res.send(err.status, err.message);
            else res.send(200, graphs);
        }).populate({ path: 'user', select: 'username' });*/


        var aggie = client.db('aggie');
        var graphCollection = aggie.collection("socialgraph")
        var graphs = await graphCollection.find({}).toArray();
        res.send(200, graphs);

    });

    app.get("/api/v1/viz", async function (req, res) {

        var aggie = client.db('aggie');

        var data = {}

        // Tag Visualization
        var tagCollection = aggie.collection('tagVisualization');
        data.tags = await tagCollection.find({}).toArray();

        // Net Graph Viz
        var reportSimScores = aggie.collection("reportsimscores");
        var reportsCollection = aggie.collection("reports");
        var smtctagsCollection = aggie.collection("smtctags");

        data.net_graph = {};

        var authors = new Set()
        var next_author_id = 0;
        var id_to_author = {};
        var author_to_id = {};

        // noinspection BadExpressionStatementJS
        let results = await async.waterfall([
            /*
            async function (callback) {
                for (let tagObj of data.tags) {

                    var observedAuthors = new Set();

                    // Get reports with tag
                    // let p = new Promise((resolve, reject) => {
                    var actualTag = await smtctagsCollection.findOne({"name": tagObj.name});
                    var relatedReports = [];
                    var reports = await reportsCollection.find({"smtcTags": {"$in": [actualTag._id]}}).toArray();

                    data.net_graph[tagObj.name] = {"nodes": [], "links": []};


                    for (const report of reports) {
                        var qualReports = await reportSimScores.find({
                            "score": {"$gt": 0.50},
                            "reports": {"$in": [report._id]}
                        }).limit(10).toArray();


                        if (qualReports.length > 0) {

                            var taggedReport = report;
                            var highestSimScores = qualReports;

                            if (!authors.has(taggedReport["author"])) {
                                authors.add(taggedReport["author"]);
                                id_to_author[next_author_id] = {
                                    "name": taggedReport["author"],
                                    "id": next_author_id,
                                    "author_type": "taggedAuthor",
                                    //"tagCategories": [] // need to add additional tags as they occur
                                };
                                data.net_graph[tagObj.name]["nodes"].push(id_to_author[next_author_id]);
                                observedAuthors.add(next_author_id);
                                author_to_id[taggedReport["author"]] = next_author_id;
                                next_author_id += 1;
                            }

                            for (let simScore of highestSimScores) {
                                let otherReportId = report["_id"] !== simScore['reports'][0] ?
                                    simScore["reports"][0] : simScore['reports'][1];

                                var otherReport = await Report.findOne({"_id": otherReportId});
                                // Add author if necessary
                                if (!authors.has(otherReport["author"])) {
                                    authors.add(otherReport["author"]);
                                    id_to_author[next_author_id] = {
                                        "name": otherReport["author"],
                                        "id": next_author_id
                                    };
                                    data.net_graph[tagObj.name]["nodes"].push(id_to_author[next_author_id]);
                                    observedAuthors.add(next_author_id);
                                    author_to_id[otherReport["author"]] = next_author_id;
                                    next_author_id += 1;
                                }

                                // Link post to author
                                data.net_graph[tagObj.name]["links"].push({
                                    "source": author_to_id[otherReport["author"]], // the relatedReport author
                                    "target": author_to_id[taggedReport["author"]], // taggedReport author
                                    "score": simScore["score"] // the simScore
                                });

                            }
                        }


                    }
               return 1;
                }
            }, */
            async function (callback) {
                var graphCollection = aggie.collection("socialgraph")

                for (let tagObj in data.tags) {
                    var the_graph = await graphCollection.findOne({"tagType": data.tags[tagObj].name});
                    data.net_graph[data.tags[tagObj].name] = the_graph;
                }
                return 1;
            },
            async function (arg1, callback) {
                // Authors Visualization
                var authorCollection = aggie.collection('authorVisualization');
                data.authors = await authorCollection.find({'read_only': false}).sort({'reportCount': -1}).limit(50).toArray();
                data.authors_read = await authorCollection.find({
                    'read_only': true,
                    'tag': 'all-tags'
                }).sort({'reportCount': -1}).limit(50).toArray();

                // Media Visualization
                var mediaCollection = aggie.collection('mediaVisualization');
                data.media = await mediaCollection.find({'read_only': false}).sort({'count': -1}).toArray();
                data.media_read = await mediaCollection.find({
                    'read_only': true,
                    'tag': 'all-tags'
                }).sort({'count': -1}).toArray();

                // Word cloud Visualization
                var wordCollection = aggie.collection('wordVisualization');
                data.words = await wordCollection.find({'read_only': false}).sort({'count': -1}).limit(200).toArray();
                data.words_read = await wordCollection.find({
                    'read_only': true,
                    'tag': 'all-tags'
                }).sort({'count': -1}).limit(200).toArray();

                // Time Visualization
                var timeCollection = aggie.collection('timeVisualization');
                data.time = await timeCollection.find({'read_only': false}).toArray();
                data.time_read = await timeCollection.find({'read_only': true, 'tag': 'all-tags'}).toArray();


                data.tagData = {
                    time: {},
                    media: {},
                    word: {},
                    author: {},
                    net_graph: {}
                };
                for (let tagObj of data.tags) {
                    data.tagData.time[tagObj.name] = await timeCollection.find({'tag': tagObj.name}).toArray();
                    data.tagData.media[tagObj.name] = await mediaCollection.find({'tag': tagObj.name}).sort({'count': -1}).toArray();
                    data.tagData.word[tagObj.name] = await wordCollection.find({'tag': tagObj.name}).sort({'count': -1}).limit(200).toArray();
                    data.tagData.author[tagObj.name] = await authorCollection.find({'tag': tagObj.name}).sort({'reportCount': -1}).limit(50).toArray();
                }

                // Send Data

                // Need to recompute sim scores to generate graph data!

                res.send(200, data);
                return;
            },

        ]);
    });
};
