// Creates and destroys bots as sources are created, enabled, disabled, destroyed, etc.
// Watches for fetching to be turned on and off and disables/enables bots accordingly.

var _ = require('underscore');
var Source = require('../../models/source');
var botFactory = require('./bot-factory');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var BotMaster = function() {
  this.bots = [];
  this.enabled = false;
};

util.inherits(BotMaster, EventEmitter);

// Initialize event listeners
BotMaster.prototype.addListeners = function(type, emitter) {
  switch (type) {
    case 'source':
      this._addSourceListeners(emitter);
      break;
    case 'fetching':
      this._addFetchingListeners(emitter);
      break;
  }
};

// Listen to changes in Source models
BotMaster.prototype._addSourceListeners = function(emitter) {
  var self = this;

  // Load bot when source is saved
  emitter.on('source:save', function(source) {
    self.load(source._id);
  });

  // Kill bots when removed from datbase
  emitter.on('source:remove', function(source) {
    var bot = self.getBot(source._id);
    if (bot) self.kill(bot);
  });

  // Listen to `enable` event from the API process
  emitter.on('source:enable', function(source) {
    var bot = self.getBot(source._id);
    if (self.enabled && bot) bot.start();
  });

  // Listen to `disable` event from the API process
  emitter.on('source:disable', function(source) {
    var bot = self.getBot(source._id);
    if (bot) bot.stop();
  });

  // Load all sources when initializing
  // Defer to next cycle to allow event listener binding
  process.nextTick(function() {
    self.loadAll();
  });
};

// Control bot master status remotely
BotMaster.prototype._addFetchingListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('fetching:start');
  emitter.removeAllListeners('fetching:stop');
  emitter.removeAllListeners('fetching:getStatus');

  emitter.on('fetching:start', function() {
    self.start();
  });
  emitter.on('fetching:stop', function() {
    self.stop();
  });
  emitter.on('fetching:getStatus', function() {
    self.emit('botMaster:status', {enabled: self.enabled});
  });
};

// Create bot from source data
BotMaster.prototype.sourceToBot = function(sourceId, callback) {
  Source.findById(sourceId, function(err, source) {
    if (err) return callback(err);
    if (!source) return callback(new Error.NotFound('source_not_found'));
    var bot = botFactory.create({source: source});
    callback(null, source, bot);
  });
};

// Load Bot from source data
BotMaster.prototype.load = function(sourceId) {
  var self = this;

  // If bot exists, kill so that it can be re-added
  var bot = this.getBot(sourceId);
  if (bot) {
    this.kill(bot);
  }

  // Get a new bot based on the Source
  this.sourceToBot(sourceId, function(err, source, bot) {
    if (err || !source) return;
    if (self.enabled && source.enabled) bot.start();
    self.add(bot);
  });
};

// Load all existing Sources
BotMaster.prototype.loadAll = function(filters, callback) {
  var self = this;
  if (typeof filters === 'function') {
    callback = filters;
    filters = undefined;
  }
  if (!callback) callback = function() {};
  // Find sources from the database
  Source.find(filters, function(err, sources) {
    if (err) return callback(err);
    if (sources.length === 0) return callback();
    var remaining = sources.length;
    sources.forEach(function(source) {
      self.load(source._id);
      // Callback after all sources have been loaded
      if (--remaining === 0) callback();
    });
  });
};

// Return bot matching the source ID
BotMaster.prototype.getBot = function(sourceId) {
  return _.find(this.bots, function(bot) {
    return sourceId.toString() === bot.source._id.toString();
  });
};

// Add Bot to array of tracked bots
BotMaster.prototype.add = function(bot) {
  var self = this;
  this.bots.push(bot);
  bot.on('report', function(report_data) {
    self.emit('bot:report', bot);
  });
  bot.on('empty', function() {
    self.emit('bot:empty', bot);
  });
  bot.on('notEmpty', function() {
    self.emit('bot:notEmpty', bot);
  });
};

// Start all bots
BotMaster.prototype.start = function() {
  var self = this;
  this.enabled = true;
  this.bots.forEach(function(bot) {
    self.enableBot(bot);
  });
};

// Stop all bots
BotMaster.prototype.stop = function() {
  var self = this;
  this.enabled = false;
  this.bots.forEach(function(bot) {
    self.disableBot(bot);
  });
};

// Kill bots
// TODO: Research possible memory leak here. It's not clear if killed bots are
// being garbage collected.
BotMaster.prototype.kill = function(bot) {
  if (bot) {
    // Stop bot to ensure unbinding of listeners
    this.disableBot(bot);
    // Remove bot instance from list of bots
    var index = this.bots.indexOf(bot);
    if (index > -1) this.bots.splice(index, 1);
  } else {
    // Kill all bots
    for (var i in this.bots) {
      this.disableBot(this.bots[i]);
      this.bots[i] = null;
      delete this.bots[i];
    }
    this.bots = [];
  }
};

// Enable bot from current process
BotMaster.prototype.enableBot = function(bot) {
  // Bail if fetching is disabled
  if (!this.enabled) return;
  if (bot.source.enabled) bot.start();
};

// Stop bot from current process
BotMaster.prototype.disableBot = function(bot) {
  bot.stop();
};

module.exports = new BotMaster();
