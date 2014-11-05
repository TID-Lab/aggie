// Fetches the reports from ReportQueue one-at-a-time and writes them to the database.
// Continues fetching and writing until there are no reports left.
// When the ReportQueue starts getting reports again it emits notEmpty, at which point processing starts again.

var Report = require('../../models/report');
var reportQueue = require('./report-queue');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ReportWriter = function() {
  var self = this;
  reportQueue.on('notEmpty', function() {
    self.process();
  });
};

util.inherits(ReportWriter, EventEmitter);

// Process all queued reports until ReportQueue is empty
ReportWriter.prototype.process = function() {
  var self = this;
  // Get next report
  var report_data = this.fetch();
  if (!report_data) return;
  // Write to database
  this.write(report_data, function(err) {
    if (err) return self.emit('error', err);
    if (reportQueue.isEmpty()) return self.emit('done');
    // Enqueue processing of the next report
    process.nextTick(function() {
      self.process();
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
