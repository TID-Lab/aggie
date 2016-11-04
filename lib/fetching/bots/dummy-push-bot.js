// Bot used for testing purposes.

var PushBot = require('./push-bot');
var util = require('util');
var _ = require('underscore');

var DummyPushBot = function(options) {
  options = _.extend(options, _.defaults(options.source.toJSON(), JSON.parse(options.source.keywords)));
  PushBot.call(this, options);
};

util.inherits(DummyPushBot, PushBot);

DummyPushBot.prototype.logDrops = function() {
  console.log('Source ' + this.source._id + ' has dropped ' + this.queue.drops + ' out of ' + this.queue.total, '(' + (Math.round(this.queue.drops / this.queue.total * 1000) / 10) + '%)');
};


module.exports = DummyPushBot;
