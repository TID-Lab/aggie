// Builds content service instance based on source type.

var logger = require('../logger');

var ContentServiceFactory = function() {};

ContentServiceFactory.prototype.create = function(options) {
  logger('ContentServiceFactory#create');
  logger.debug(options);
  var SubContentService = this.csType(options.source.type);
  return new SubContentService(options.source);
};

ContentServiceFactory.prototype.csType = function(sourceType) {
  return require('./content-services/' + sourceType + '-content-service');
};

// Export a new instance, ensuring a singleton
module.exports = new ContentServiceFactory();
