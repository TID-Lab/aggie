// Builds content service instance based on source media.

var _ = require('underscore');

var ContentServiceFactory = function() {};

// Creates a new content service to match the given source.
ContentServiceFactory.prototype.create = function(source) {
  var SubClass = this.subClass(source.media);

  // Content services use only the lastReportDate, url, and keywords params.
  return new SubClass(_.pick(source, 'lastReportDate', 'url', 'keywords'));
};

// Gets the appropriate ContentService subclass based on the given media.
ContentServiceFactory.prototype.subClass = function(media) {
  return require('./content-services/' + media + '-content-service');
};

// Export a new instance, ensuring a singleton
module.exports = new ContentServiceFactory();
