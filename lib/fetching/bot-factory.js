// Creates appropriate bots (push/pull) based on content service type.

var _ = require('underscore');
var contentServiceFactory = require('./content-service-factory');

var BotFactory = function() {};

// Builds a new bot of the appropriate type for the given source.
// Also creates a content service for the given source.
BotFactory.prototype.create = function(source) {
  var contentService = contentServiceFactory.create(source);
  var SubClass = this.subClass(contentService);
  return new SubClass({ source: source, contentService: contentService });
};

// Determines the appropriate bot subclass to use by checking the contentService's fetchType.
BotFactory.prototype.subClass = function(contentService) {
  return require('./bots/' + contentService.fetchType + '-bot');
};

// Export a new instance, ensuring a singleton
module.exports = new BotFactory();
