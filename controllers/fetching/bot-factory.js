var csFactory = require('./content-service-factory');

module.exports = function createBot(options) {
  var contentService = csFactory(options);
  var SubBot = botType(contentService);
  return new SubBot(contentService);
};

var botType = function(contentService) {
  if (typeof contentService === 'string') {
    return require('./bots/' + contentService + '-bot');
  } else {
    return require('./bots/' + contentService.type + '-bot');
  }
};
