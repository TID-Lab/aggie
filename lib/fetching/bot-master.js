// Creates and destroys bots as sources are created, enabled, disabled, destroyed, etc.
// Watches for fetching to be turned on and off and disables/enables bots accordingly.

var _ = require('underscore');
var Source = require('../../models/source');
var botFactory = require('./bot-factory');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var config = require('../../config/secrets').get();
var async = require('async');

var BotMaster = function() {
  this.bots = [];
  this.enabled = config.fetching;
};

util.inherits(BotMaster, EventEmitter);

BotMaster.prototype.init = function(callback) {
  this._loadAll(callback || function(){});
}

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

// Stops everything and removes all bots.
BotMaster.prototype.reset = function() {
  this.stop();
  this.kill();
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

// Listen to changes in Source models
BotMaster.prototype._addSourceListeners = function(emitter) {
  var self = this;

  // Load bot when source is saved
  emitter.on('source:save', function(source) {
    // We pass the ID here as that's all we might have.
    self._loadOne(source._id, function(){});
  });

  // Kill bots when removed from datbase
  emitter.on('source:remove', function(source) {
    var bot = self._getBot(source._id);
    if (bot) self.kill(bot);
  });

  // Listen to `enable` event from the API process
  emitter.on('source:enable', function(source) {
    var bot = self._getBot(source._id);
    if (self.enabled && bot) bot.start();
  });

  // Listen to `disable` event from the API process
  emitter.on('source:disable', function(source) {
    var bot = self._getBot(source._id);
    if (bot) bot.stop();
  });
};

// Control bot master status remotely
BotMaster.prototype._addFetchingListeners = function(emitter) {
  var self = this;

  // Clean-up old listeners
  emitter.removeAllListeners('fetching:start');
  emitter.removeAllListeners('fetching:stop');

  emitter.on('fetching:start', function() {
    self.start();
  });
  emitter.on('fetching:stop', function() {
    self.stop();
  });
};

// Creates bots for all existing Sources
BotMaster.prototype._loadAll = function(callback) {
  var self = this;
  // Find sources from the database
  Source.find({media: {'$ne': null }}, function(err, sources) {
    if (err) return callback(err);
    async.each(sources, function(s,c){ self._loadOne(s,c); }, callback);
  });
};

// Loads Bot from source data
// Calls callback when loading complete.
BotMaster.prototype._loadOne = function(sourceObjOrId, callback) {
  var self = this;

  // Resolve argument.
  var sourceId = (sourceObjOrId instanceof Object) ? sourceObjOrId._id : sourceObjOrId;
  var source = (sourceObjOrId instanceof Object) ? sourceObjOrId : null;

  // If bot for this source already exists, kill so that it can be re-added
  var bot = this._getBot(sourceId);
  if (bot) this.kill(bot);

  // Get a new bot based on the Source
  if (source) {
    this._add(botFactory.create(source));
    callback();
  } else {
    Source.findById(sourceId, function(err, source) {
      if (err) return callback(err);
      if (!source) return callback(new Error.NotFound('source_not_found'));
      self._add(botFactory.create(source));
      callback();
    });
  }
};

// Add Bot to array of tracked bots
BotMaster.prototype._add = function(bot) {
  var self = this;
  this.bots.push(bot);
  this.emit('botMaster:addedBot');
  bot.on('report', function(report_data) {
    self.emit('bot:report', bot);
  });
  bot.on('empty', function() {
    self.emit('bot:empty', bot);
  });
  bot.on('notEmpty', function() {
    self.emit('bot:notEmpty', bot);
  });

  this.enableBot(bot);
};

// Return bot matching the source ID
BotMaster.prototype._getBot = function(sourceId) {
  return _.find(this.bots, function(bot) {
    return sourceId.toString() === bot.source._id.toString();
  });
};

module.exports = new BotMaster();
