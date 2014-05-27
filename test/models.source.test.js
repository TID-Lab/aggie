require('./init');
var expect = require('chai').expect;
var Source = require('../models/source');

describe('Query attributes', function() {
  it('should return validation errors', function(done) {
    Source.create({url: 'hey'}, function(err, source) {
      expect(err).to.have.keys(['message', 'name', 'errors']);
      expect(err.errors).to.have.keys(['nickname', 'url']);
      expect(err.errors.nickname.type).to.equal('required');
      expect(err.errors.url.message).to.contain('Invalid URL');
      done();
    });
  });
});
