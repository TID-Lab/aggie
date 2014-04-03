var Report = require('../../models/report');
var reportQueue = require('./report-queue');

var ReportWriter = function() {
  var self = this;
  reportQueue.on('notEmpty', function() {
    self.process();
  });
};

// Process all queued reports until ReportQueue is empty
ReportWriter.prototype.process = function() {
  // Process one report at a time, asynchronously
  this._processNextReport();
};

ReportWriter.prototype._processNextReport = function() {
  var self = this;
  // Get next report
  var report_data = this.fetch();
  if (!report_data) return;
  // Write to database
  this.write(report_data, function(err) {
    if (err) return self.emit('error', err);
    if (reportQueue.isEmpty()) return;
    // Enqueue processing of the next report
    process.nextTick(function() {
      self._processNextReport();
    });
  });
};

// Fetch next report from the ReportQueue
ReportWriter.prototype.fetch = function() {
  return reportQueue.nextReport();
};

// Write report data to database
ReportWriter.prototype.write = function(report_data, callback) {
  Report.create(report_data, callback);
};

module.exports = new ReportWriter();
