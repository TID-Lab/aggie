var Report = require('../../models/report');
var botMaster = require('./bot-master');
var reportQueue = require('./report-queue');

var ReportWriter = function() {
  this._busy = false;
  var self = this;
  botMaster.on('bot:reports', function() {
    self.process();
  });
};

// Process all queued reports, one bot at a time
ReportWriter.prototype.process = function(callback) {
  if (!callback) callback = function() {};
  // Return if busy
  if (this._busy) return callback();
  // Mark as busy
  this._busy = true;
  var self = this;
  // Process one report at a time, asynchronously
  (function processNextReport() {
    // Get next report
    var report_data = self.fetch();
    if (!report_data) return callback();
    // Write to database
    self.write(report_data, function(err) {
      if (err) return callback(err);
      if (reportQueue.isEmpty()) {
        self._busy = false;
        return callback();
      }
      // Enqueue processing of the next report
      process.nextTick(processNextReport);
    });
  })();
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
