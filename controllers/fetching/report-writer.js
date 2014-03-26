var Report = require('../../models/report');
var botMaster = require('./bot-master');

var ReportWriter = function() {
  this.busy = false;
  var self = this;
  process.on('bot:reports', function(bot) {
    self.fetch(bot);
  });
};

ReportWriter.prototype.fetch = function(bot) {
  if (this.busy) return;
  this.busy = true;
  var report_data = bot.fetchNext();
  this.write(report_data);
};

ReportWriter.prototype.write = function(report_data) {
  var self = this;
  Report.create(report_data, function(err, report) {
    self.busy = false;
  });
};

module.exports = new ReportWriter();
