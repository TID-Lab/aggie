var ContentServiceFactory = function() {};

ContentServiceFactory.prototype.create = function(options) {
  var SubContentService = this.csType(options.source);
  return new SubContentService(options);
};

ContentServiceFactory.prototype.csType = function(source) {
  return require('./content-services/' + source + '-content-service');
};

// Export a new instance, ensuring a singleton
module.exports = new ContentServiceFactory();
