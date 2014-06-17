require('./init');
var expect = require('chai').expect;
var TrendQueryer = require('../lib/analytics/trend-queryer');
var Trend = require('../models/trend');
var Query = require('../models/query');
var ReportQuery = require('../models/query/report-query');
var Report = require('../models/report');
var timekeeper = require('timekeeper');
var _ = require('underscore');

var trendQueryer;
describe('Trend queryer', function() {
  before(function(done) {
    Trend.create({_query: Query.hash(new ReportQuery({keywords: 'test'}))}, function(err, trend) {
      if (err) return done(err);
      trendQueryer = new TrendQueryer({trend: trend});
      done();
    });
  });

  it('should track query object', function(done) {
    expect(trendQueryer).to.have.property('trend');
    expect(trendQueryer.trend).to.be.an.instanceof(Trend);
    done();
  });

  it('should get query associated with trend', function(done) {
    expect(trendQueryer).to.have.property('query');
    expect(trendQueryer.query).to.be.an.instanceof(Query);
    expect(trendQueryer.query.keywords).to.contain('test');
    done();
  });

  it('should run query associated with trend', function(done) {
    Report.create({content: 'test'});
    Report.create({content: 'testing this'});
    Report.create({content: 'but not this'});
    Report.create({content: 'this should also be tested'});
    Report.create({content: 'but this one should not'});
    setTimeout(function() {
      trendQueryer.runQuery(function(err, counts) {
        if (err) return done(err);
        expect(counts).to.be.an.instanceof(Array);
        expect(counts).to.have.length(1);
        expect(counts[0]).to.have.keys(['timebox', 'counts']);
        expect(counts[0].counts).to.equal(3);
        Trend.remove(function() {
          done();
        });
      });
    }, 100);
  });

  it('should run query without keywords', function(done) {
    Trend.create({_query: Query.hash(new ReportQuery({sourceType: 'test', since: 1}))}, function(err, trend) {
      if (err) return done(err);
      trendQueryer = new TrendQueryer({trend: trend});
      setTimeout(function() {
        Report.create({content: 'foo', _sourceType: 'bar'});
        Report.create({content: 'baz', _sourceType: 'test'});
        setTimeout(function() {
          trendQueryer.runQuery(function(err, counts) {
            if (err) return done(err);
            expect(counts).to.be.an.instanceof(Array);
            expect(counts).to.have.length(1);
            expect(counts[0]).to.have.keys(['timebox', 'counts']);
            expect(counts[0].counts).to.equal(1);
            done();
          });
        }, 100);
      }, 100);
    });
  });

  it('should group analytics by 5-minute timeboxes', function(done) {
    Trend.create({_query: Query.hash(new ReportQuery({keywords: 'qwerty'}))}, function(err, trend) {
      setTimeout(function() {
        if (err) return done(err);
        trendQueryer = new TrendQueryer({trend: trend});

        // Create one report now
        Report.create({content: 'qwerty'});

        process.nextTick(function() {
          // Create two reports 5 minutes in the future
          timekeeper.travel(new Date(Date.now() + 300000));
          Report.create({content: 'qwerty'});
          Report.create({content: 'qwerty'});

          process.nextTick(function() {
            // Create three reports 10 minutes in the future
            timekeeper.travel(new Date(Date.now() + 600000));
            Report.create({content: 'qwerty'});
            Report.create({content: 'qwerty'});
            Report.create({content: 'qwerty'});

            setTimeout(function() {
              // Run trend analytics
              trendQueryer.runQuery(function(err, counts) {
                if (err) return done(err);
                expect(counts).to.be.an.instanceof(Array);
                expect(counts).to.have.length(3);
                counts = _.sortBy(counts, 'timebox');
                expect(counts[0].counts).to.equal(1);
                expect(counts[1].counts).to.equal(2);
                expect(counts[2].counts).to.equal(3);
                timekeeper.reset();
                done();
              });
            }, 100);
          });
        });
      }, 100);
    });
  });

  it('should back-fill trend counts for old reports', function(done) {
    // Create reports
    Report.create({content: 'backfill'});
    Report.create({content: 'backfill'});
    Report.create({content: 'backfill'});
    setTimeout(function() {
      // Travel 10 minutes into the future
      timekeeper.travel(new Date(Date.now() + 60000));
      // Create a new trend
      Trend.create({_query: Query.hash(new ReportQuery({keywords: 'backfill'}))}, function(err, trend) {
        if (err) return done(err);
        trendQueryer = new TrendQueryer({trend: trend});
        trendQueryer.backFill(function(err, counts) {
          if (err) return done(err);
          expect(counts).to.be.an.instanceof(Array);
          expect(counts).to.have.length(1);
          expect(counts[0]).to.have.keys(['timebox', 'counts']);
          expect(counts[0].counts).to.equal(3);
          done();
        });
      });
    }, 500);
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
