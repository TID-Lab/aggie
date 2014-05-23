var database = require('../lib/database');
var mongoose = database.mongoose;

var Query = function(attributes) {
  for (var i in attributes) {
    this[i] = attributes[i];
  }
};

// Query database
Query.prototype.runQuery = function(callback) {
  throw new Error('runQuery method needs to be implemented');
};

// Normalize query for comparison
Query.prototype.normalize = function() {
  throw new Error('normalize method needs to be implemented');
};

// Create a string that represents a normalized query
Query.hash = function(query) {
  if (!(query instanceof Query)) query = new Query(query);
  return JSON.stringify(query.normalize());
};

// Compare hashed normalized queries
Query.compare = function(query1, query2) {
  return Query.hash(query1) === Query.hash(query2);
};

module.exports = Query;
