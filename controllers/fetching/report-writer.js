var Report = require('../../models/report');
var botMaster = require('./bot-master');

var ReportWriter = function() {
  this.busy = false;
  var self = this;
  process.on('bot:reports', function() {
    self.process();
  });
};

// Process all queued reports, one bot at a time
ReportWriter.prototype.process = function(callback) {
  if (!callback) callback = function() {};
  // Return if busy
  if (this.busy) return callback();
  // Mark as busy
  this.busy = true;
  var self = this;
  // Clone bot list
  var bots = botMaster.bots.slice(0);
  // Process one bot at a time, asynchronously
  (function processOneBot() {
    // Get next bot
    var bot = bots.splice(0, 1)[0];
    // Process reports from bot
    self.processBot(bot, function(err) {
      if (err) return callback(err);
      if (bots.length === 0) {
        self.busy = false;
        return callback();
      }
      // Process next bot asynchronously
      process.nextTick(processOneBot);
    });
  })();
};

// Process all reports from a single bot, one at a time
ReportWriter.prototype.processBot = function(bot, callback) {
  if (bot.isEmpty()) return callback();
  var self = this;
  (function processOneReport() {
    // Fetch next report
    var report_data = self.fetch(bot);
    if (!report_data) return callback();
    // Write to database
    self.write(report_data, function(err) {
      if (err) return callback(err);
      // Process next report asynchronously
      process.nextTick(processOneReport);
    });
  })();
};

// Fetch next report from a bot
ReportWriter.prototype.fetch = function(bot) {
  return bot.fetchNext();
};

// Write report data to database
ReportWriter.prototype.write = function(report_data, callback) {
  Report.create(report_data, callback);
};

module.exports = new ReportWriter();
