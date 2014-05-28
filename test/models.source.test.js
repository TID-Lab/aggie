require('./init');
var expect = require('chai').expect;
var Source = require('../models/source');

describe('Source attributes', function() {
  it('should return validation errors', function(done) {
    Source.create({url: 'hey'}, function(err, source) {
      expect(err).to.have.keys(['message', 'name', 'errors']);
      expect(err.errors).to.have.keys(['nickname', 'url']);
      expect(err.errors.nickname.type).to.equal('required');
      expect(err.errors.url.message).to.contain('Invalid URL');
      done();
    });
  });

  it('should return total number of errors', function(done) {
    var one = new Source({nickname: 'one', type: 'dummy'});
    var two = new Source({nickname: 'two', type: 'dummy'});
    one.logEvent('error', 'Error 1');
    two.logEvent('warning', 'Warning 1');
    two.logEvent('warning', 'Warning 2');
    setTimeout(function() {
      Source.countAllErrors(function(err, count) {
        if (err) return done(err);
        expect(count).to.equal(3);
        done();
      });
    }, 100);
  });
});
