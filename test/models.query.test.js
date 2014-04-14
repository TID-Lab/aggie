require('./init');
var expect = require('chai').expect;
var Query = require('../models/query');

var queryData, queryId;
describe('Query attributes', function() {
  before(function(done) {
    queryData = {
      type: 'Report',
      keywords: 'test'
    };
    done();
  });

  it('should instantiate a new query', function(done) {
    Query.getQuery(queryData, function(err, query) {
      if (err) return done(err);
      query.save(function(err, query, numberAffected) {
        if (err) return done(err);
        queryId = query._id;
        expect(query).to.be.an.instanceof(Query);
        expect(numberAffected).to.equal(1);
        done();
      });
    });
  });

  it('should get an existing query', function(done) {
    Query.getQuery(queryData, function(err, query) {
      if (err) return done(err);
      query.save(function(err, query, numberAffected) {
        if (err) return done(err);
        expect(query).to.be.an.instanceof(Query);
        expect(numberAffected).to.equal(0);
        expect(query._id).to.contain(queryId);
        done();
      });
    });
  });
});
