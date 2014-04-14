var _ = require('underscore');
var contentServiceFactory = require('./content-service-factory');

var BotFactory = function() {};

BotFactory.prototype.create = function(options) {
  options.contentService = contentServiceFactory.create(options);
  var SubBot = this.botType(options.contentService);
  return new SubBot(options);
};

BotFactory.prototype.botType = function(contentService) {
  return require('./bots/' + contentService.botType + '-bot');
};

// Export a new instance, ensuring a singleton
module.exports = new BotFactory();
