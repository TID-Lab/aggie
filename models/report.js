var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  fetchedAt: Date,
  authoredAt: Date,
  createdAt: Date,
  timebox: Number,
  content: String,
  author: String,
  status: String,
  url: String
});

module.exports = mongoose.model('Report', schema);
