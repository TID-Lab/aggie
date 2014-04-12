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

  // Instantiate new bot when new source is created
  emitter.on('create', function(source_data) {
    if (!self.enabled) source_data.enabled = false;
    self.load(source_data);
  });

  // Kill bots when removed from datbase
  emitter.on('remove', function(source_data) {
    var bot = self.getBot(source_data);
    if (bot) self.kill(bot);
  });

  // Listen to `enable` event from the API process
  emitter.on('enable', function(source_data) {
    var bot = self.getBot(source_data);
    if (self.enabled && bot) bot.start();
  });

  // Listen to `disable` event from the API process
  emitter.on('disable', function(source_data) {
    var bot = self.getBot(source_data);
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
BotMaster.prototype.sourceToBot = function(source_data) {
  var bot_data = _.pick(source_data, ['resource_id', 'url', 'keywords']);
  bot_data.sourceType = source_data.type;
  var bot = botFactory.create(bot_data);
  bot._sourceId = source_data._id;
  return bot;
};

// Load Bot from source data
BotMaster.prototype.load = function(source_data) {
  var bot = this.getBot(source_data);
  if (bot) this.kill(bot);
  else bot = this.sourceToBot(source_data);
  if (this.enabled && source_data.enabled) bot.start();
  this.add(bot);
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
      self.load(source);
      // Callback after all sources have been loaded
      if (--remaining === 0) callback();
    });
  });
};

// Get all bots matching the filter hash
BotMaster.prototype.getBot = function(filters) {
  var keys = ['sourceType', 'resource_id', 'url', 'keywords'];
  if (!filters.sourceType) filters.sourceType = filters.type;
  filters = _.pick(filters, keys);
  return _.find(this.bots, function(bot) {
    return _.chain(bot.contentService).pick(keys).isEqual(filters).value();
  });
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
    Source.findByBot(bot, function(err, source) {
      if (source) source.logEvent('warning', warning.message);
    });
  });
  bot.on('error', function(error) {
    // Log error in Source
    Source.findByBot(bot, function(err, source) {
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

BotMaster.prototype.enableBot = function(bot) {
  // Start bot from current process
  if (this.enabled) bot.start();
  // Find corresponding source
  Source.findByBot(bot, function(err, source) {
    // Enable source
    if (source) source.enable();
  });
};

BotMaster.prototype.disableBot = function(bot) {
  // Stop bot from current process
  bot.stop();
  // Find corresponding source
  Source.findByBot(bot, function(err, source) {
    // Disable source
    if (source) source.disable();
  });
};

module.exports = new BotMaster();
