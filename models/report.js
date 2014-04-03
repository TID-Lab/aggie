var mongoose = require('mongoose');
var Source = require('./source');

var schema = new mongoose.Schema({
  authoredAt: Date,
  fetchedAt: Date,
  storedAt: Date,
  timebox: Number,
  content: String,
  author: String,
  status: String,
  url: String,
  source: [Source.schema]
});

schema.pre('save', function(next) {
  var report = this;
  report.storedAt = Date.now();
  if (!report.source[0]) return next();
  report.source[0]._id = undefined;
  // Find actual source object and store it as a sub-document
  Source.findOne(report.source[0], function(err, source) {
    if (err) return next(err);
    report.source[0] = source;
    next();
  });
});

module.exports = mongoose.model('Report', schema);
