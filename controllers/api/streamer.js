var Query = require('../../models/query');
var Report = require('../../models/report');
var _ = require('underscore');

var QUERY_INTERVAL = 100; // 100ms

var Streamer = function() {
  this.queries = [];
  var self = this;
  Query.on('query', function(query) {
    self.addQuery(query);
  });
};

Streamer.prototype.addQuery = function(query) {
  var find = _.where(this.queries, _.omit(query, '_id'));
  if (!find.length) this.queries.push(query);
};

Streamer.prototype.query = function() {
  var self = this;
  var remaining = this.queries.length;
  this.queries.forEach(function(query) {
    Report.queryReports(query, function(err, reports) {
      if (err) self.emit('error', err);
      else self.emit('reports', query, reports);
      if (--remaining === 0) {
        setTimeout(function() {
          self.query();
        }, QUERY_INTERVAL);
      }
    });
  });
};

module.exports = new Streamer();
