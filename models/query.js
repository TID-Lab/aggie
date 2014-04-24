var database = require('../controllers/database');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  type: String, // The object type being queried
  keywords: String,
  pertinence: String, // The Report pertinence being sought
  after: Date, // Lower date bound
  before: Date, // Upper date bound
  lastSearchedAt: Date // The time this Query was last executed
});

module.exports = mongoose.model('Query', schema);
