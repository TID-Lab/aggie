'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var async = require('async');
var Source = require('../../backend/models/source');

describe('Source attributes', function() {
  it('should return validation errors', function(done) {
    // This shouldn't get saved because it should error
    Source.create({ url: 'hey' }, function(err) {
      expect(err).to.have.keys(['_message', 'errors']);
      expect(err.errors).to.have.keys(['nickname', 'url']);
      expect(err.errors.url.message).to.contain('Validator failed for path `url` with value `hey`');
      done();
    });
  });

  it('should return total number of errors', function(done) {
    // These are not saved to the database
    var one = new Source({ nickname: 'one', type: 'dummy' });
    var two = new Source({ nickname: 'two', type: 'dummy' });
    async.series([
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

  after(function(done) {
    var remove = Source.remove.bind(Source, {});
    remove(done);
  });
  after(utils.expectModelsEmpty);
});
