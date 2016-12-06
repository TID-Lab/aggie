// Receives reports from a content service and stores in a circular queue.
// If reports are arriving too quickly, the queue will overflow and the oldest
// reports will be overwritten first, due to nature of circular queue.
// If this happens, it is written to the log.
// Provides reports one-at-a-time via calls to fetchNext.

'use strict';

var CircularQueue = require('./circular-queue');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var logger = require('../logger');

// options.source - The source for which this bot will be fetching.
// options.contentService - The contentService which this bot governs.
function Bot(options) {
  this.source = options.source;
  this.contentService = this.contentService || options.contentService;
  this.type = this.contentService.fetchType;
  this.queue = new CircularQueue(options.queueCapacity);
  this.enabled = false;
  this.incomingEventName = 'report';
  // Variable to determine whether the Bot needs to log dropped reports.
  this._logDrops = { timeout: true, notEmpty: true };

  this._reportListener = this._reportListener.bind(this);
  this._warningListener = this._warningListener.bind(this);
  this._errorListener = this._errorListener.bind(this);
}

util.inherits(Bot, EventEmitter);

Bot.prototype.start = function() {
  if (this.enabled) return;
  this.enabled = true;
  this.contentService.on(this.incomingEventName, this._reportListener);
  this.contentService.on('warning', this._warningListener);
  this.contentService.on('error', this._errorListener);
};

Bot.prototype.logDrops = function() {
  if (_.all(_.values(this._logDrops))) {
    this._handleError('warning', new Error('Queue full, dropping reports. See queue status for updates.'));
    this._logDrops = { timeout: false, notEmpty: false };
    var self = this;
    setTimeout(function() {
      self._logDrops.timeout = true;
    }, 60000);
    this.once('notEmpty', function() {
      self._logDrops.notEmpty = true;
    });
  }
};

Bot.prototype.stop = function() {
  this.enabled = false;
  this.contentService.removeListener(this.incomingEventName, this._reportListener);
  this.contentService.removeListener('warning', this._warningListener);
  this.contentService.removeListener('error', this._errorListener);
  this.removeAllListeners('error');
};

// Fetch next available report in the queue
Bot.prototype.fetchNext = function() {
  // Return if queue is empty
  if (this.isEmpty()) return;

  var reportData = this.queue.fetch();

  // Notify of queue being empty
  if (this.isEmpty()) {
    this.emit('empty');
  }

  return reportData;
};

Bot.prototype.isEmpty = function() {
  return this.queue.isEmpty();
};

Bot.prototype.clearQueue = function() {
  this.queue.clear();
  this.emit('empty');
};

Bot.prototype._reportListener = function(reportData) {
  if (this.enabled) {
    if (this.isEmpty()) this.emit('notEmpty');

    // Need to add _sources foreign key reference here b/c ContentService
    // doesn't know about Source.
    // If we are in experimental mode or we're getting a tweet, then these
    // values may already be in the report
    reportData._sources = reportData._sources || [this.source._id];
    reportData._media = reportData._media || this.source.media;
    reportData._sourceNicknames = reportData._sourceNicknames || [this.source.nickname];
    // We initialize the report tags with the ones associated to its source
    if (!reportData.tags) {
      reportData.tags = _.clone(this.source.tags);
      if (reportData._media === 'twitter') {
        reportData.metadata.retweet ? reportData.tags.push('RT') : reportData.tags.push('NO_RT');
      }
      if (reportData._media === 'facebook') {
        reportData.metadata.isComment ? reportData.tags.push('FBComment') : reportData.tags.push('FBPost');
      }
    }

    var drops = this.queue.drops;
    this.queue.add(reportData);

    // If the last report was dropped, we may need to log this.
    if (this.queue.drops > drops) this.logDrops();

    this.emit('report', reportData);
  }
};

Bot.prototype._warningListener = function(warning) {
  this._handleError('warning', warning);
};

Bot.prototype._errorListener = function(error) {
  this._handleError('error', error);
};

// Log errors
Bot.prototype._handleError = function(type, error) {
  var message = error instanceof Error ? error.message : error;

  this.source.logEvent(type, message, function(err) {
    if (err) logger.error(err.message);
  });
  logger[type](error);
};

module.exports = Bot;
