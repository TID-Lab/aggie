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

function BotMaster() {
  this.bots = [];
  this.isFetching = config.get().fetching;
}

util.inherits(BotMaster, EventEmitter);

BotMaster.prototype.init = function(callback) {
  this._loadAll(callback || _.noop);
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
  }
};

// Stops everything and removes all bots.
BotMaster.prototype.reset = function() {
  this.stop();
  this.kill();
};

// In both the below functions, ensure that they do nothing to all bots that are originally disabled
// Start is called when fetching is turned on
// Stop is called when fetching is turned off

// Start all bots
BotMaster.prototype.start = function() {
  var self = this;
  this.isFetching = true;
  this.bots.forEach(function(bot) {
    /*
    if (!bot.enabled) {
      console.log("inside botmaster.start");
      console.log("bot.enabled is: " + bot.enabled);
      console.log("bot.source.enabled is: " + bot.source.enabled);
      console.log(bot.source.nickname + " was originally disabled, so not enabling it.");
      return;
    }
    */
    self.enableBot(bot, function() {});
  });
};

// Stop all bots
BotMaster.prototype.stop = function() {
  var self = this;
  this.isFetching = false;
  this.bots.forEach(function(bot) {
    console.log("Disabling bot with nickname: " + bot.source.nickname);
    /*
    if (!bot.enabled) {
      console.log("inside botmaster.stop");
      console.log("bot.enabled is: " + bot.enabled);
      console.log("bot.source.enabled is: " + bot.source.enabled);
      console.log(bot.source.nickname + " was already disabled, so returning.");
      return;
    }
    */
    self.disableBot(bot, function() {});
  });
};

// Kill bots
// TODO: Research possible memory leak here. It's not clear if killed bots are
// being garbage collected.
BotMaster.prototype.kill = function(bot) {
  if (bot) {
    // Stop bot to ensure unbinding of listeners
    this.disableBot(bot, function() {});
    // Remove bot instance from list of bots
    var index = this.bots.indexOf(bot);
    if (index > -1) this.bots.splice(index, 1);
  } else {
    // Kill all bots
    for (var i in this.bots) {
      this.disableBot(this.bots[i], function() {});
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
  if (!this.isFetching) return;
  // New code
  Source.findById(bot.source._id, function(err, source) {
    if (err) return callback(err);
    bot.source = source;
    if (source.enabled) bot.start();
    callback();
  });
  // End new code
  /*
  console.log("Inside enable Bot");
  if (bot.source.enabled) bot.start();
  console.log("bot.enabled is: " + bot.enabled);
  console.log("bot.source.enabled is: " + bot.source.enabled);
  */
};

// Stop bot from current process
BotMaster.prototype.disableBot = function(bot, callback) {
  Source.findById(bot.source._id, function(err, source) {
    if (err) callback (err);
    bot.source = source;
    if (source.enabled) bot.stop();
    callback();
  });
  // bot.stop();
};

// Listen to changes in Source models
BotMaster.prototype._addSourceListeners = function(emitter) {
  var self = this;

  // Load bot when source is saved
  emitter.on('source:save', function(source) {
    // We pass the ID here as that's all we might have.
    self._loadOne(source._id, function() {});
  });

  // Kill bots when removed from datbase
  emitter.on('source:remove', function(source) {
    var bot = self._getBot(source._id);
    if (bot) self.kill(bot);
  });

  // Listen to `enable` event from the API process
  emitter.on('source:enable', function(source) {
    // This should ensure fetching button does its job
    /*
    if (!self.isFetching) {
      return;
    }
    */
    var bot = self._getBot(source._id);
    if (self.isFetching && bot) bot.start();
  });

  // Listen to `disable` event from the API process
  emitter.on('source:disable', function(source) {
    // This should ensure fetching button does its job
    /*
    if (!self.isFetching) {
      return;
    }
    */
    var bot = self._getBot(source._id);
    if (bot) bot.stop();
  });

  // Listen to `disable` event from the fetching process
  // This meant for non-recoverable errors coming from the sources/bots
  Source.schema.on('source:disable', function(source) {
    self._getBot(source._id).stop();
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
    console.log("Fetching has been turned on.");
    console.log("Availble number of bots is: " + self.bots.length);
    self.start();
  });
  emitter.on('fetching:stop', function() {
    console.log("Fetching has been turned off.");
    console.log("Availble number of bots is: " + self.bots.length);
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
  // Find sources from the database
  Source.find({ media: { '$ne': null } }, function(err, sources) {
    if (err) return callback(err);
    async.each(sources, function(s,c){
       self._loadOne(s,c); 
    }, callback);
  });
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
  this.on('settingsUpdated:' + bot.source.media, function() {
    bot.contentService.reloadSettings();
  });
  bot.on('report', function(report_data) {
    self.emit('bot:report', bot); // Note: I think nothing listens to this
  });
  bot.on('empty', function() {
    self.emit('bot:empty', bot);
  });
  bot.on('notEmpty', function() {
    self.emit('bot:notEmpty', bot);
  });

  this.enableBot(bot, function() {});
};

// Return bot matching the source ID
BotMaster.prototype._getBot = function(sourceId) {
  return _.find(this.bots, function(bot) {
    return sourceId.toString() === bot.source._id.toString();
  });
};

module.exports = new BotMaster();
