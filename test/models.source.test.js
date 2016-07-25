'use strict';

require('./init');
var expect = require('chai').expect;
var async = require('async');
var Source = require('../models/source');

describe('Source attributes', function() {
  it('should return validation errors', function(done) {
    Source.create({ url: 'hey' }, function(err) {
      expect(err).to.have.keys(['message', 'name', 'errors']);
      expect(err.errors).to.have.keys(['nickname', 'url']);
      expect(err.errors.nickname.type).to.equal('required');
      expect(err.errors.url.message).to.contain('Validator failed for path `url` with value `hey`');
      done();
    });
  });

  it('should return total number of errors', function(done) {
    var one = new Source({ nickname: 'one', type: 'dummy' });
    var two = new Source({ nickname: 'two', type: 'dummy' });
    async.parallel([
      one.logEvent.bind(one, 'error', 'Error 1'),
      two.logEvent.bind(two, 'warning', 'Warning 1'),
      two.logEvent.bind(two, 'warning', 'Warning 2')
    ],
    function(err) {
      if (err) return done(err);
      Source.countAllErrors(function(err, count) {
        if (err) return done(err);
        expect(count).to.equal(3);
        done();
      });
    });
  });
});
