var _ = require('underscore');
var Source = require('../../models/source');
var botFactory = require('./bot-factory');

var BotMaster = function() {
  var self = this;
  this.bots = [];

  // Instantiate new bots when sources are saved
  process.on('source:save', function(source) {
    var bot_data = _.omit(source, ['_id', 'type']);
    bot_data.source = source.type;
    var bot = botFactory.create(bot_data);
    // Add to master list
    self.add(bot);
  });
};

BotMaster.prototype.add = function(bot) {
  this.bots.push(bot);
};

BotMaster.prototype.start = function() {
  this.bots.forEach(function(bot) {
    bot.start();
  });
};

BotMaster.prototype.stop = function() {
  this.bots.forEach(function(bot) {
    bot.stop();
  });
};

BotMaster.prototype.kill = function() {
  for (var i in this.bots) {
    delete this.bots[i];
  }
  this.bots = [];
};

module.exports = new BotMaster();
