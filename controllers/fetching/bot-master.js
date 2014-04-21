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
// Initialize event listeners
BotMaster.prototype._addSourceListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('save');
  emitter.removeAllListeners('remove');
  emitter.removeAllListeners('enable');
  emitter.removeAllListeners('disable');

  // Load bot when source is saved
  emitter.on('save', function(source) {
    self.load(source._id);
  });

  // Kill bots when removed from datbase
  emitter.on('remove', function(source) {
    var bot = self.getBot(source._id);
    if (bot) self.kill(bot);
  });

  // Listen to `enable` event from the API process
  emitter.on('enable', function(source) {
    var bot = self.getBot(source._id);
    if (self.enabled && bot) bot.start();
  });

  // Listen to `disable` event from the API process
  emitter.on('disable', function(source) {
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
  emitter.removeAllListeners('start');
  emitter.removeAllListeners('stop');
  emitter.removeAllListeners('getStatus');

  emitter.on('start', function() {
    self.start();
  });
  emitter.on('stop', function() {
    self.stop();
  });
  emitter.on('getStatus', function() {
    self.emit('status', {enabled: self.enabled});
  });
};

// Create bot from source data
BotMaster.prototype.sourceToBot = function(sourceId, callback) {
  Source.findById(sourceId, function(err, source) {
    if (err) return callback(err);
    if (!source) return callback(new Error.NotFound('source_not_found'));
    var bot_data = _.pick(source, ['resource_id', 'url', 'keywords', 'enabled']);
    bot_data.sourceId = source._id.toString();
    bot_data.sourceType = source.type;
    var bot = botFactory.create(bot_data);
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

// Get all bots matching the filter hash
BotMaster.prototype.getBot = function(sourceId) {
  return _.findWhere(this.bots, {sourceId: sourceId.toString()});
};

// Add Bot to array of tracked bots
BotMaster.prototype.add = function(bot) {
  var self = this;
  this.bots.push(bot);
  bot.on('reports', function(reports_data) {
    self.emit('bot:reports', bot);
  });
  bot.on('empty', function() {
    self.emit('bot:empty', bot);
  });
  bot.on('notEmpty', function() {
    self.emit('bot:notEmpty', bot);
  });
  bot.on('warning', function(warning) {
    // Log warning in Source
    Source.findById(bot.sourceId, function(err, source) {
      if (source) source.logEvent('warning', warning.message);
    });
  });
  bot.on('error', function(error) {
    // Log error in Source
    Source.findById(bot.sourceId, function(err, source) {
      if (source) {
        source.logEvent('error', error.message);
        source.disable();
      }
    });
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
  // Find corresponding source
  Source.findById(bot.sourceId, function(err, source) {
    // Enable bot if source is enabled
    if (source && source.enabled) bot.start();
  });
};

// Stop bot from current process
BotMaster.prototype.disableBot = function(bot) {
  bot.stop();
};

module.exports = new BotMaster();
