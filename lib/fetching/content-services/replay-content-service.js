// Used for experimental purposes.

var ContentService = require('../content-service');
var util = require('util');
var _ = require('underscore');

var JSONStream = require('jsonstream');
var join = require('path').join;
var fs = require ('fs');
var file = join(__dirname, '../../../../', 'reports.json');


var ReplayContentService = function(options) {
  //  this.interval = options.interval || 1; // Emit report every %interval milliseconds
  this._keywords = options.keywords;
  this.fetchType = 'push';
  this.lastTimestamp;
  this._parser = JSONStream.parse([]);
  var self = this;
  this._parser.on('data', function(report) {
    // We cannot use old _ids
    if (report._id) delete report._id;
    if (report.storedAt) delete report.storedAt;

    report.fetchedAt = new Date(report.fetchedAt.$date);
    if (!this.lastTimestamp) this.lastTimestamp = report.fetchedAt;
    var interval = report.fetchedAt - this.lastTimestamp;
    this.lastTimestamp = report.fetchedAt;
    console.log(interval);
    console.log(report.fetchedAt);
    setTimeout(self.emit('report', report), interval);
  }); // this.emitAndWait.bind(this));
  this._parser.on('end', this.stop.bind(this));

};

util.inherits(ReplayContentService, ContentService);

// Start streaming of filtered data
ReplayContentService.prototype.start = function() {
  console.log('Starting content service');
  this._isStreaming = true;
  fs.createReadStream(file).pipe(this._parser);
 };

ReplayContentService.prototype.emitAndWait = function(report) {
  // if (this.lastTimestamp === 0) {
  //   this.lastTimestamp = report.fetchedAt;
  // }
  // setTimeout(report.fetchedAt - this.lastTimestamp, function(){})
  console.log('emiting report');
  this.emit('report', report);
};


// Stop the stream
ReplayContentService.prototype.stop = function() {
  this._isStreaming = false;
};

// Use random jitter to avoid clustered requests
ReplayContentService.prototype._interval = function() {
  var diff = this.interval / 10;
  return this.interval - diff + Math.floor(Math.random() * 2 * diff);
};

module.exports = ReplayContentService;
