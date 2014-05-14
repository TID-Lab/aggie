var database = require('../lib/database');
var mongoose = database.mongoose;
var _ = require('underscore');

var schema = new mongoose.Schema({
  type: String, // The object type being queried
  keywords: String,
  status: String, // The Report pertinence being sought
  after: Date, // Lower date bound
  before: Date, // Upper date bound
  since: Date, // The time this Query was last executed
  sourceId: String,
  sourceType: String
});

// Normalize query for comparison
schema.methods.normalize = function() {
  var query = _.pick(this.toJSON(), ['type', 'keywords', 'status', 'after', 'before', 'sourceType', 'sourceId']);
  if (query.keywords) {
    // Make all keywords lowercase, then sort them alphabetically
    query.keywords = query.keywords.replace(/(,|\s)+/g, ' ').split(' ').map(function(w) {
      return w.toLowerCase();
    }).sort().join(' ');
  }
  return query;
};

var Query = mongoose.model('Query', schema);

// Create a string that represents a normalized query
Query.hash = function(query) {
  if (!(query instanceof mongoose.Model)) query = new Query(query);
  return JSON.stringify(query.normalize());
};

Query.compare = function(query1, query2) {
  return Query.hash(query1) === Query.hash(query2);
};

module.exports = Query;
