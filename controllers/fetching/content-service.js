// Wrapper class for specific content services
var ContentService = function(options) {
  var source = options.type || 'dummy';
  var SubContentService = require('./content-services/' + source + '-content-service');
  return new SubContentService(options.filter);
};

module.exports = ContentService;
