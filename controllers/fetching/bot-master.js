var _ = require('underscore');
var Source = require('../../models/source');
var botFactory = require('./bot-factory');

var BotMaster = function() {
  var self = this;
  this.bots = [];

  // Instantiate new bots when sources are saved
  process.on('source:save', function(source_data) {
    self.load(source_data);
  });

  // Kill bots when removed from datbase
  process.on('source:remove', function(source_data) {
    var bot = self.sourceToBot(source_data);
    self.kill(bot);
  });
};

// Create bot from source data
BotMaster.prototype.sourceToBot = function(source_data) {
  var bot_data = _.pick(source_data, ['resource_id', 'url', 'keywords']);
  bot_data.sourceType = source_data.type;
  return botFactory.create(bot_data);
};

// Load Bot from source data
BotMaster.prototype.load = function(source_data) {
  var bot = this.sourceToBot(source_data);
  this.kill(bot);
  this.add(bot);
};

// Load all existing Sources
BotMaster.prototype.loadAll = function(filters, callback) {
  var self = this;
  if (typeof filters === 'function') {
    callback = filters;
    filters = undefined;
  }
  // Find sources from the database
  Source.find(filters, function(err, sources) {
    if (err) return callback(err);
    var remaining = sources.length;
    sources.forEach(function(source) {
      self.load(source);
      // Callback after all sources have been loaded
      if (--remaining === 0 && callback) callback();
    });
  });
};

// Get all bots matching the filter hash
BotMaster.prototype.getBots = function(filters) {
  var keys = ['sourceType', 'resource_id', 'url', 'keywords'];
  filters = _.pick(filters, keys);
  return _.filter(this.bots, function(bot) {
    return _.chain(bot.contentService).pick(keys).isEqual(filters).value();
  });
};

// Add Bot to array of tracked bots
BotMaster.prototype.add = function(bot) {
  this.bots.push(bot);
};

// Start all bots
BotMaster.prototype.start = function() {
  this.bots.forEach(function(bot) {
    bot.start();
  });
};

// Stop all bots
BotMaster.prototype.stop = function() {
  this.bots.forEach(function(bot) {
    bot.stop();
  });
};

// Kill bots
// TODO: Research possible memory leak here. It's not clear if killed bots are
// being garbage collected.
BotMaster.prototype.kill = function(bot) {
  if (bot) {
    // Remove bot instance from list of bots
    this.bots = _.without(this.bots, bot);
  } else {
    // Kill all bots
    for (var i in this.bots) {
      this.bots[i] = null;
      delete this.bots[i];
    }
    this.bots = [];
  }
};

module.exports = new BotMaster();
