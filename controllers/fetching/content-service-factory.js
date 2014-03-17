module.exports = function createContentService(options) {
  var SubContentService = csType(options.source);
  return new SubContentService(options);
};

var csType = function(source) {
  return require('./content-services/' + source + '-content-service');
};
