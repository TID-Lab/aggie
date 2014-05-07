require('./init');
var expect = require('chai').expect;
var TrendQuerier = require('../lib/analytics/trend-querier');
var Trend = require('../models/trend');
var Query = require('../models/query');
var Report = require('../models/report');
var timekeeper = require('timekeeper');

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

  it('should group analytics by 5-minute timeboxes', function(done) {
    // Create one report now
    Report.create({content: 'test'});

    process.nextTick(function() {
      // Create two reports 5 minutes in the future
      timekeeper.travel(new Date(Date.now() + 300000));
      Report.create({content: 'test'});
      Report.create({content: 'test'});

      process.nextTick(function() {
        // Create three reports 10 minutes in the future
        timekeeper.travel(new Date(Date.now() + 600000));
        Report.create({content: 'test'});
        Report.create({content: 'test'});
        Report.create({content: 'test'});

        setTimeout(function() {
          // Run trend analytics
          trendQuerier.runQuery(function(err, counts) {
            if (err) return done(err);
            expect(counts).to.be.an.instanceof(Array);
            expect(counts).to.have.length(3);
            expect(counts[0].counts).to.equal(1);
            expect(counts[1].counts).to.equal(2);
            expect(counts[2].counts).to.equal(3);
            timekeeper.reset();
            done();
          });
        }, 100);
      });
    });
  });

  // Clean up
  after(function(done) {
    Trend.remove(function(err) {
      if (err) return done(err);
      Report.remove(function(err) {
        if (err) return done(err);
        done();
      });
    });
  });
});
