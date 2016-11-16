// Creates and destroys bots as sources are created, enabled, disabled, destroyed, etc.
// Watches for fetching to be turned on and off and disables/enables bots accordingly.
'use strict';

var _ = require('underscore');
var Source = require('../../models/source');
var botFactory = require('./bot-factory');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var config = require('../../config/secrets');
var async = require('async');
var logger = require('../logger');

function BotMaster() {
  this.bots = [];
  this.isFetching = config.get().fetching;
}

util.inherits(BotMaster, EventEmitter);

BotMaster.prototype.init = function(callback) {
  this._loadAll(callback || function(err) {
    if (err) logger.error(err.message);
  });
};

// Initialize event listeners
BotMaster.prototype.addListeners = function(type, emitter) {
  switch (type) {
  case 'source':
    this._addSourceListeners(emitter);
    break;
  case 'fetching':
    this._addSettingsListeners(emitter);
    break;
  case 'own':
    this._addOwnListeners();
    break;
  }
};

// Stops everything and removes all bots.
BotMaster.prototype.reset = function() {
  this.stop();
  this.kill();
};

// Start all bots
BotMaster.prototype.start = function(callback) {
  this.isFetching = true;
  async.each(this.bots, this.enableBot.bind(this), callback);
};

// Stop all bots
BotMaster.prototype.stop = function() {
  var self = this;
  this.isFetching = false;
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

// This is called when a new bot is added, and when botmaster.start is called.
// Enable bot from current process
BotMaster.prototype.enableBot = function(bot, callback) {
  // Bail if fetching is disabled
  if (!this.isFetching) return setImmediate(callback);

  if (config.get().experiment) {
    // Only expecting replay source bot when experiment
    if (bot.source.media === 'replay') {
      bot.start();
      setImmediate(callback);
    }
  } else {
    Source.findById(bot.source._id, function(err, source) {
      if (err) return callback(err);
      bot.source = source;
      if (source.enabled) bot.start();
      callback();
    });
  }
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
    self._loadOne(source._id, function(err) {
      if (err) logger.error(err.message);
    });
  });

  // Kill bots when removed from datbase
  emitter.on('source:remove', function(source) {
    var bot = self._getBot(source._id);
    if (bot) self.kill(bot);
  });

  // Listen to `enable` event from the API process
  emitter.on('source:enable', function(source) {
    var bot = self._getBot(source._id);
    if (self.isFetching && bot) bot.start();
  });

  // Listen to `disable` event from the API process
  emitter.on('source:disable', function(source) {
    var bot = self._getBot(source._id);
    if (bot) bot.stop();
  });
};

BotMaster.prototype._addOwnListeners = function() {
  var self = this;
  // Listen to `disable` event from the fetching process
  // This meant for non-recoverable errors coming from the sources/bots
  Source.schema.on('source:disable', function(source) {
    var bot = self._getBot(source._id);
    if (bot) bot.stop();
  });
};

// Control bot master status remotely and other settings' changes
BotMaster.prototype._addSettingsListeners = function(emitter) {
  var self = this;
  var mediaValues = Source.getMediaValues();

  // Clean-up old listeners
  emitter.removeAllListeners('fetching:start');
  emitter.removeAllListeners('fetching:stop');
  emitter.removeAllListeners('settingsUpdated');

  emitter.on('fetching:start', function() {
    self.start(function(err) {
      if (err) logger.error(err.message);
    });
  });

  emitter.on('fetching:stop', function() {
    self.stop();
  });

  emitter.on('settingsUpdated', function(data) {
    // We reload the config here for the fetching process
    config.get({ reload: true });
    self.emit('settingsUpdated:' + data.setting);
  });
};

// Creates bots for all existing Sources
BotMaster.prototype._loadAll = function(callback) {
  var self = this;

  if (config.get().experiment) {
    // We enter experimental mode, ignore other sources
    this._add(botFactory.create({ media: 'replay', enabled: true }), callback);
  } else {
    // Find sources from the database
    Source.find({ media: { $ne: null } }, function(err, sources) {
      if (err) return callback(err);
      async.each(sources, self._loadOne.bind(self), callback);
    });
  }
};

// Loads Bot from source data
// Calls callback when loading complete.
BotMaster.prototype._loadOne = function(sourceObjOrId, callback) {
  var self = this;

  // Resolve argument.
  var sourceId = sourceObjOrId instanceof Object ? sourceObjOrId._id : sourceObjOrId;
  var source = sourceObjOrId instanceof Object ? sourceObjOrId : null;

  // If bot for this source already exists, kill so that it can be re-added
  var bot = this._getBot(sourceId);
  if (bot) this.kill(bot);

  // Get a new bot based on the Source
  if (source) {
    this._add(botFactory.create(source), callback);
  } else {
    Source.findById(sourceId, function(err, source) {
      if (err) return callback(err);
      if (!source) return callback(new Error.NotFound('source_not_found'));
      self._add(botFactory.create(source), callback);
    });
  }
};

// Add Bot to array of tracked bots
BotMaster.prototype._add = function(bot, callback) {
  var self = this;
  this.bots.push(bot);
  this.emit('botMaster:addedBot');
  this.on('settingsUpdated:' + bot.source.media, function() {
    bot.contentService.reloadSettings();
  });
  bot.on('report', function() {
    self.emit('bot:report', bot); // Note: I think nothing listens to this - Philip
  });
  bot.on('empty', function() {
    self.emit('bot:empty', bot);
  });
  bot.on('notEmpty', function() {
    self.emit('bot:notEmpty', bot);
  });

  this.enableBot(bot, callback);
};

// Return bot matching the source ID
BotMaster.prototype._getBot = function(sourceId) {
  return _.find(this.bots, function(bot) {
    return sourceId.toString() === bot.source._id.toString();
  });
};

module.exports = new BotMaster();
