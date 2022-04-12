// Handles CRUD requests for reports.
"use strict";

const database = require('../../database');
const client = database.mongoose.connection.client;

exports.visualization_words = async (req, res) => {
  const aggie = client.db('aggie');
  let data = {}

  // Word cloud Visualization
  const wordCollection = aggie.collection('wordVisualization');
  data.words = await wordCollection.find({'read_only': false}).sort({'count': -1}).limit(200).toArray();
  data.words_read = await wordCollection.find({'read_only': true, 'tag': 'all-tags'}).sort({'count': -1}).limit(200).toArray();

  // Send Data
  res.send(200, data);
}

exports.visualization_authors = async (req, res) => {
  const aggie = client.db('aggie');
  let data = {}
  // Authors Visualization
  const authorCollection = aggie.collection('authorVisualization');
  data.authors = await authorCollection.find({'read_only': false}).sort({'reportCount': -1}).limit(50).toArray();
  data.authors_read = await authorCollection.find({'read_only': true, 'tag': 'all-tags'}).sort({'reportCount': -1}).limit(50).toArray();
  // Send Data
  res.send(200, data);
}


exports.visualization_tags = async (req, res) => {
  const aggie = client.db('aggie');
  let data = {}
  // Tag Visualization
  const tagCollection = aggie.collection('tagVisualization');
  const authorCollection = aggie.collection('authorVisualization');
  const mediaCollection = aggie.collection('mediaVisualization');
  const wordCollection = aggie.collection('wordVisualization');
  const timeCollection = aggie.collection('timeVisualization');

  data.tags = await tagCollection.find({}).toArray();
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

exports.visualization_time = async (req, res) => {
  const aggie = client.db('aggie');
  let data = {}
  // Time Visualization
  let timeCollection = aggie.collection('timeVisualization');
  data.time = await timeCollection.find({'read_only': false}).toArray();
  data.time_read = await timeCollection.find({'read_only': true, 'tag': 'all-tags'}).toArray();
  data.maxTimeCount = 0;
  data.maxReadTimeCount = 0;
  let totalSum = 0;
  let totalReadSum = 0;
  data.time.forEach((value)=> {
    if (value.count > data.maxTimeCount) {
      data.maxTimeCount = value.count;
    }
    totalSum += value.count;
  });
  data.time_read.forEach((value)=> {
    if (value.count > data.maxReadTimeCount) {
      data.maxReadTimeCount = value.count;
    }
    totalReadSum += value.count;
  });
  const earliestDate = new Date(data.time[0].year, data.time[0].month, data.time[0].day, data.time[0].hour);
  const latestDate = new Date(data.time[data.time.length - 1].year, data.time[data.time.length - 1].month, data.time[data.time.length -1].day, data.time[data.time.length -1].hour);
  const hoursBetween = (latestDate.getTime() - earliestDate.getTime())/(1000 * 3600);
  data.avgTimeCount = totalSum / hoursBetween;
  data.avgReadTimeCount = totalReadSum / hoursBetween;

  // Send Data
  res.send(200, data);
}

exports.visualization_media = async (req, res) => {
  const aggie = client.db('aggie');
  let data = {}
  // Media Visualization
  let mediaCollection = aggie.collection('mediaVisualization');
  data.media = await mediaCollection.find({'read_only': false}).sort({'count': -1}).toArray();
  data.media_read = await mediaCollection.find({'read_only': true, 'tag': 'all-tags'}).sort({'count': -1}).toArray();
  // Send Data
  res.send(200, data);
}
