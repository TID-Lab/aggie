require('./init');
var expect = require('chai').expect;
var _ = require('underscore');
var streamer = require('../controllers/api/streamer');
var Query = require('../models/query');

describe('Streamer', function() {
  it('should track Query objects', function(done) {
    var query = Query.getQuery({type: 'Report'});
    setTimeout(function() {
      expect(streamer.queries).to.be.an.instanceof(Array);
      expect(streamer.queries).to.not.be.empty;
      done();
    }, 100);
  });
  it('should periodically run queries', function(done) {
    done();
  });
});
