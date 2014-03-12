var expect = require('chai').expect;
var Bot = require('../controllers/fetching/bot');

describe('Bot', function() {
  before(function(done) {
    bot = new Bot();
    done();
  });

  it('should get content from a content service', function() {
  });

});
