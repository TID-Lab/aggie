var ContentServiceFactory = function() {};

ContentServiceFactory.prototype.create = function(options) {
  var SubContentService = this.csType(options.sourceType);
  return new SubContentService(options);
};

ContentServiceFactory.prototype.csType = function(sourceType) {
  return require('./content-services/' + sourceType + '-content-service');
};

// Export a new instance, ensuring a singleton
module.exports = new ContentServiceFactory();
