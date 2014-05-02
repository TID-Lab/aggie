var database = require('../lib/database');
var mongoose = database.mongoose;
var textSearch = require('mongoose-text-search');
var Source = require('./source');
var Query = require('./query');
var _ = require('underscore');

var schema = new mongoose.Schema({
  authoredAt: Date,
  fetchedAt: Date,
  storedAt: Date,
  timebox: Date,
  content: String,
  author: String,
  status: String,
  url: String,
  _source: {type: String, ref: 'Source'}
});

// Give the report schema text search capabilities
schema.plugin(textSearch);
// Add a text index to the `content` field
schema.index({content: 'text'});

schema.pre('save', function(next) {
  if (this.isNew) this._wasNew = true;
  this.storedAt = new Date();
  this.timebox = getTimebox();
  next();
});

// Calculate 5-minute timebox
function getTimebox(date) {
  if (!date) date = Date.now();
  else if (typeof date === 'date') date = date.getTime();

  var seconds = Math.floor(date / 100000);
  var timebox;
  switch (seconds % 10) {
    case 1:
    case 2:
      timebox = (seconds - (seconds % 10)) * 100000;
      break;
    case 4:
    case 5:
      timebox = (seconds - (seconds % 10)) * 100000 + 300000;
      break;
    case 7:
    case 8:
      timebox = (seconds - (seconds % 10)) * 100000 + 600000;
      break;
    default:
      timebox = seconds * 100000;
      break;
  }
  return new Date(timebox);
}

schema.post('save', function() {
  if (this._wasNew) schema.emit('report', {_id: this._id.toString()});
  else if (this.isModified('status')) schema.emit('report:status', {_id: this._id.toString(), status: this.status});
});

var Report = mongoose.model('Report', schema);

// Query reports based on passed query data
var QUERY_LIMIT = 20;
Report.queryReports = function(query, callback) {
  if (typeof query === 'function') return Report.find(query);
  if (query instanceof Query) query = query.normalize();

  query.limit = query.limit || QUERY_LIMIT;
  query.filter = {};

  // Determine status filter
  if (query.status) {
    query.filter.status = {};
    if (query.status === 'assigned') query.filter.status.$exists = true;
    else if (query.status === 'unassigned') query.filter.status.$exists = false;
    else query.filter.status = query.status;
  }

  // Determine inclusive date filters
  if (query.after || query.before) {
    query.filter.storedAt = {};
    if (query.after) query.filter.storedAt.$gte = query.after;
    if (query.before) query.filter.storedAt.$lte = query.before;
  }

  // Convert sourceId to _source ID for Report compatibility
  if (query.sourceId) query.filter._source = query.sourceId;

  // Return only newer results
  if (query.since) {
    query.filter.storedAt = query.filter.storedAt || {};
    query.filter.storedAt.$gte = query.since;
  }

  // Re-set search timestamp
  query.since = new Date();

  if (!query.keywords) {
    // Just use filters when no keywords are provided
    Report.find(query.filter, function(err, reports) {
      if (err) return callback(err);
      callback(null, reports);
    });
  } else {
    Report.textSearch(query.keywords, _.pick(query, ['filter', 'limit']), function(err, reports) {
      if (err) return callback(err);
      callback(null, _.pluck(reports.results, 'obj'));
    });
  }
};

// Analyze trends for a given keyword
// @see http://docs.mongodb.org/manual/tutorial/text-search-in-aggregation
Report.analyzeTrend = function(query, callback) {
  if (!query.keywords) return callback(new Error('Query needs a keyword to analyze'));

  var pipeline = [
    {$match: {$text: {$search: query.keywords}}},
    {$match: {storedAt: {$gte: query.since || new Date(0)}}},
    {$group: {_id: "$timebox", counts: {$sum: 1}}}
  ];

  // Re-set search timestamp
  query.since = new Date();

  Report.aggregate(pipeline, function(err, trends) {
    if (err) callback(err);
    else callback(null, trends);
  });
};

module.exports = Report;
