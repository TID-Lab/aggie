var _ = require('underscore');
var Source = require('../../models/source');
var botFactory = require('./bot-factory');

var BotMaster = function() {
  var self = this;
  this.bots = [];

  // Instantiate new bots when sources are saved
  process.on('source:save', function(source) {
    self.load(source);
  });
};

// Load Bot from source data
BotMaster.prototype.load = function(source) {
  var bot_data = _.pick(source, ['resource_id', 'url', 'keywords']);
  bot_data.sourceType = source.type;
  // Kill existing matching bots
  var existing = this.getBot(bot_data);
  if (existing) {
    this.kill(existing);
  }
  // And reload them
  var bot = botFactory.create(bot_data);
  this.add(bot);
};

// Load all existing Sources
BotMaster.prototype.loadAll = function(filters, callback) {
  var self = this;
  if (typeof filters === 'function') {
    callback = filters;
    filters = undefined;
  }
  Source.find(filters, function(err, sources) {
    var remaining = sources.length;
    if (!err) sources.forEach(function(source) {
      self.load(source);
      if (--remaining === 0 && callback) callback();
    });
  });
};

// Return Bot matching filters
BotMaster.prototype.getBot = function(filters) {
  var keys = ['sourceType', 'resource_id', 'url', 'keywords'];
  filters = _.pick(filters, keys);
  var bot = _.find(this.bots, function(bot) {
    return _.chain(bot.contentService).pick(keys).isEqual(filters).value();
  });
  return bot;
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
    // Kill single bot
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
