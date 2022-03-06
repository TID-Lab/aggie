// Handles CRUD requests for reports.
"use strict";

var database = require('../../database');
var client = database.mongoose.connection.client;

exports.visualization_data = async (req, res) => {
  var aggie = client.db('aggie');

  var data = {}

  // Tag Visualization
  var tagCollection = aggie.collection('tagVisualization');
  data.tags = await tagCollection.find({}).toArray();

  // Authors Visualization
  var authorCollection = aggie.collection('authorVisualization');
  data.authors = await authorCollection.find({'read_only': false}).sort({'reportCount': -1}).limit(50).toArray();
  data.authors_read = await authorCollection.find({'read_only': true, 'tag': 'all-tags'}).sort({'reportCount': -1}).limit(50).toArray();

  // Media Visualization
  var mediaCollection = aggie.collection('mediaVisualization');
  data.media = await mediaCollection.find({'read_only': false}).sort({'count': -1}).toArray();
  data.media_read = await mediaCollection.find({'read_only': true, 'tag': 'all-tags'}).sort({'count': -1}).toArray();

  // Word cloud Visualization
  var wordCollection = aggie.collection('wordVisualization');
  data.words = await wordCollection.find({'read_only': false}).sort({'count': -1}).limit(200).toArray();
  data.words_read = await wordCollection.find({'read_only': true, 'tag': 'all-tags'}).sort({'count': -1}).limit(200).toArray();

  // Time Visualization
  var timeCollection = aggie.collection('timeVisualization');
  data.time = await timeCollection.find({'read_only': false}).toArray();
  data.time_read = await timeCollection.find({'read_only': true, 'tag': 'all-tags'}).toArray();

  data.tagData = {
    time: {},
    media: {},
    word: {},
    author: {}
  };
  for (let tagObj of data.tags) {
    data.tagData.time[tagObj.name] = await timeCollection.find({'tag': tagObj.name}).toArray();
    data.tagData.media[tagObj.name] = await mediaCollection.find({'tag': tagObj.name}).sort({'count': -1}).toArray();
    data.tagData.word[tagObj.name] = await wordCollection.find({'tag': tagObj.name}).sort({'count': -1}).limit(200).toArray();
    data.tagData.author[tagObj.name] = await authorCollection.find({'tag': tagObj.name}).sort({'reportCount': -1}).limit(50).toArray();
  }

  // Send Data
  res.send(200, data);
}
