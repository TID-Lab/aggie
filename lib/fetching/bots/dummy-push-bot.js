var PushBot = require('./push-bot');
var util = require('util');
var _ = require('underscore');

var DummyPushBot = function(options) {
  options = _.extend(options, _.defaults(options.source.toJSON(), JSON.parse(options.source.keywords)));
  PushBot.call(this, options);
};

util.inherits(DummyPushBot, PushBot);

DummyPushBot.prototype.logDrops = function() {
  console.log('drops', this.source._id, this.queue.drops);
};


module.exports = DummyPushBot;
