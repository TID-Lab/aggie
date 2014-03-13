var expect = require('chai').expect;
var Bot = require('../controllers/fetching/bot');
var ContentService = require('../controllers/fetching/content-service');

describe('Bot', function() {
  before(function(done) {
    bot = new Bot({type: 'dummy', filter: 't'});
    done();
  });

  it('should instantiate a content service', function() {
    expect(bot).to.have.property('contentService');
    expect(bot.contentService).to.be.instanceOf(ContentService);
  });

});
