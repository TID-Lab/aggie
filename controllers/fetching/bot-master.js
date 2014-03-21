var _ = require('underscore');

var BotMaster = function() {
  this.bots = [];
};

BotMaster.prototype.add = function(bot) {
  this.bots.push(bot);
};

BotMaster.prototype.start = function(bot) {
  if (bot) return bot.start();
  this.bots.forEach(function(bot) {
    bot.start();
  });
};

BotMaster.prototype.stop = function(bot) {
  if (bot) return bot.stop();
  this.bots.forEach(function(bot) {
    bot.stop();
  });
};

BotMaster.prototype.kill = function(bot) {
  if (bot) {
    this.bots = _.without(this.bots, bot);
    bot.removeAllListeners();
    bot = undefined;
    return;
  }
  this.bots = _.map(this.bots, function(bot) {
    bot.removeAllListeners();
    return undefined;
  });
  this.bots = [];
};

module.exports = new BotMaster();
