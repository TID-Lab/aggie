var Report = require('../../models/report');
var reportQueue = require('./report-queue');

var ReportWriter = function() {
  var self = this;
  reportQueue.on('notEmpty', function() {
    self.process();
  });
};

// Process all queued reports, one bot at a time
ReportWriter.prototype.process = function(callback) {
  if (!callback) callback = function() {};
  // Process one report at a time, asynchronously
  this._processNextReport(callback);
};

ReportWriter.prototype._processNextReport = function(callback) {
  var self = this;
  // Get next report
  var report_data = this.fetch();
  if (!report_data) return callback();
  // Write to database
  this.write(report_data, function(err) {
    if (err) return callback(err);
    if (reportQueue.isEmpty()) {
      return callback();
    }
    // Enqueue processing of the next report
    process.nextTick(function() {
      self._processNextReport(callback);
    });
  });
};

// Fetch next report from the next bot
ReportWriter.prototype.fetch = function() {
  return reportQueue.nextReport();
};

// Write report data to database
ReportWriter.prototype.write = function(report_data, callback) {
  Report.create(report_data, callback);
};

module.exports = new ReportWriter();
