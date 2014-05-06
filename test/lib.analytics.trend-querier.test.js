require('./init');
var expect = require('chai').expect;
var TrendQuerier = require('../lib/analytics/trend-querier');
var Trend = require('../models/trend');
var Query = require('../models/query');
var Report = require('../models/report');

var trendQuerier;
describe('Trend querier', function() {
  before(function(done) {
    Query.create({type: 'Report', keywords: 'test'}, function(err, query) {
      if (err) return done(err);
      Trend.create({_query: query._id, timebox: 300}, function(err, trend) {
        if (err) return done(err);
        trendQuerier = new TrendQuerier({trend: trend});
        done();
      });
    });
  });

  it('should track query object', function(done) {
    expect(trendQuerier).to.have.property('trend');
    expect(trendQuerier.trend).to.be.an.instanceof(Trend);
    done();
  });

  it('should get query associated with trend', function(done) {
    trendQuerier.getQuery(function(err, query) {
      if (err) return done(err);
      expect(query).to.be.an.instanceof(Query);
      expect(query.keywords).to.contain('test');
      expect(trendQuerier).to.have.property('query');
      expect(trendQuerier.query).to.be.an.instanceof(Query);
      expect(trendQuerier.query).to.equal(query);
      done();
    });
  });

  it('should run query associated with trend', function(done) {
    Report.create({content: 'test'});
    Report.create({content: 'testing this'});
    Report.create({content: 'but not this'});
    Report.create({content: 'this should also be tested'});
    Report.create({content: 'but this one should not'});
    setTimeout(function() {
      trendQuerier.runQuery(function(err, counts) {
        if (err) return done(err);
        expect(counts).to.be.an.instanceof(Array);
        expect(counts).to.have.length(1);
        expect(counts[0]).to.have.property('counts');
        expect(counts[0].counts).to.equal(3);
        done();
      });
    }, 100);
  });
});
