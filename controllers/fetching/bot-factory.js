var _ = require('underscore');
var contentServiceFactory = require('./content-service-factory');

var BotFactory = function() {};

BotFactory.prototype.create = function(options) {
  var contentService = contentServiceFactory.create(options);
  var SubBot = this.botType(contentService);
  return new SubBot(_.extend(contentService, {queueCapacity: options.queueCapacity}));
};

BotFactory.prototype.botType = function(contentService) {
  return require('./bots/' + contentService.botType + '-bot');
};

// Export a new instance, ensuring a singleton
module.exports = new BotFactory();
