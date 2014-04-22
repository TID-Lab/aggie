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

var Query = mongoose.model('Query', schema);

// Find a query that matches the parameters, or instantiate a new one
Query.getQuery = function(queryData, callback) {
  if (queryData instanceof mongoose.Model) queryData = queryData.toObject();
  Query.findOne(queryData, function(err, query) {
    if (query === null) query = new Query(queryData);
    Query.emit('query', query.toJSON());
    if (callback) callback(err, query);
  });
};

module.exports = Query;
