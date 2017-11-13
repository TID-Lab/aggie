// Used for experimental purposes.
'use strict';

var ContentService = require('../content-service');
var util = require('util');

var JSONStream = require('JSONStream');
var join = require('path').join;
var fs = require ('fs');
var config = require('../../../config/secrets');

var file = join(__dirname, '../../../', config.get().experimentFile);


function ReplayContentService(options) {
  this._keywords = options.keywords;
  this.fetchType = 'push';
  this.lastTimestamp = 0;
  this._parser = JSONStream.parse([]);
  this._parser.on('data', this.waitAndEmit.bind(this));
  this._parser.on('end', this.stop.bind(this));
}

util.inherits(ReplayContentService, ContentService);

// Start streaming of filtered data
ReplayContentService.prototype.start = function() {
  this._isStreaming = true;
  fs.createReadStream(file).pipe(this._parser);
};

ReplayContentService.prototype.waitAndEmit = function(report) {

  if (report._id) delete report._id;
  if (report.storedAt) delete report.storedAt;

  report.fetchedAt = new Date(report.fetchedAt.$date);

  // We set the timestamp for the first report
  if (this.lastTimestamp === 0) this.lastTimestamp = report.fetchedAt;
  var interval = report.fetchedAt - this.lastTimestamp;
  this.lastTimestamp = report.fetchedAt;

  setTimeout(this.emit.bind(this), interval, 'report', report);
};

// Stop the stream
ReplayContentService.prototype.stop = function() {
  this._isStreaming = false;
};

module.exports = ReplayContentService;
