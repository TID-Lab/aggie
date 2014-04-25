var database = require('../controllers/database');
var mongoose = require('mongoose');
var _ = require('underscore');

var schema = new mongoose.Schema({
  type: String, // The object type being queried
  keywords: String,
  pertinence: String, // The Report pertinence being sought
  after: Date, // Lower date bound
  before: Date, // Upper date bound
  since: Date // The time this Query was last executed
});

schema.methods.hash = function() {
  var hash = _.pick(this.toJSON(), ['type', 'keywords', 'pertinence', 'after', 'before']);
  hash.keywords = hash.keywords.replace(/(,|\s)+/g, ' ').split(' ').map(function(w) {
    return w.toLowerCase();
  }).sort().join(' ');
  return hash;
};

module.exports = mongoose.model('Query', schema);
