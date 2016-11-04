'use strict';
var utils = require('./init');
var expect = require('chai').expect;
var TrendQueryer = require('../../lib/analytics/trend-queryer');
var Trend = require('../../models/trend');
var Query = require('../../models/query');
var ReportQuery = require('../../models/query/report-query');
var Report = require('../../models/report');
var timekeeper = require('timekeeper');
var _ = require('underscore');
var async = require('async');

var trendQueryer;
describe('Trend queryer', function() {
  before(function(done) {
    Trend.create({ _query: Query.hash(new ReportQuery({ keywords: 'test' })) }, function(err, trend) {
      if (err) return done(err);
      trendQueryer = new TrendQueryer({ trend: trend });
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
    Report.create([
      { content: 'test' },
      { content: 'testing this' },
      { content: 'but not this' },
      { content: 'this should also be tested' },
      { content: 'but this one should not' }
    ], function(err) {
      if (err) return done(err);
      trendQueryer.runQuery(function(err, counts) {
        if (err) return done(err);
        expect(counts).to.be.an.instanceof(Array);
        expect(counts).to.have.length(1);
        expect(counts[0]).to.have.keys(['timebox', 'counts']);
        expect(counts[0].counts).to.equal(3);
        Trend.remove(done);
      });
    });
  });

  it('should run query without keywords', function(done) {
    async.waterfall([
      function(next) {
        Trend.create({
          _query: Query.hash(new ReportQuery({ media: 'test', since: 1 }))
        }, next);
      },
      function(trend, next) {
        trendQueryer = new TrendQueryer({ trend: trend });
        Report.create([
          { content: 'foo', _media: 'bar' },
          { content: 'baz', _media: 'test' }
        ], next);
      },
      function(doc1, doc2, next) {
        trendQueryer.runQuery(next);
      },
      function(counts, next) {
        expect(counts).to.be.an.instanceof(Array);
        expect(counts).to.have.length(1);
        expect(counts[0]).to.have.keys(['timebox', 'counts']);
        expect(counts[0].counts).to.equal(1);
        setImmediate(next);
      }
    ], done);
  });

  it('should group analytics by 5-minute timeboxes', function(done) {
    async.waterfall([
      function(next) {
        Trend.create({
          _query: Query.hash(new ReportQuery({ keywords: 'qwerty' }))
        }, next);
      },
      function(trend, next) {
        trendQueryer = new TrendQueryer({ trend: trend });

        // Create one report now
        Report.create({ content: 'qwerty' }, next);
      },
      function(doc, next) {
        // Create two reports 5 minutes in the future
        timekeeper.travel(new Date(Date.now() + 300000));
        Report.create([
          { content: 'qwerty' },
          { content: 'qwerty' }
        ], next);
      },
      function(doc1, doc2, next) {
        // Create three reports 10 minutes in the future
        timekeeper.travel(new Date(Date.now() + 600000));
        Report.create([
          { content: 'qwerty' },
          { content: 'qwerty' },
          { content: 'qwerty' }
        ], next);
      },
      function(doc1, doc2, doc3, next) {
        // Run trend analytics
        trendQueryer.runQuery(next);
      },
      function(counts, next) {
        expect(counts).to.be.an.instanceof(Array);
        expect(counts).to.have.length(3);
        counts = _.sortBy(counts, 'timebox');
        expect(counts[0].counts).to.equal(1);
        expect(counts[1].counts).to.equal(2);
        expect(counts[2].counts).to.equal(3);
        timekeeper.reset();
        setImmediate(next);
      }
    ], done);
  });

  it('should back-fill trend counts for old reports', function(done) {
    async.waterfall([
      function(next) {
        // Create reports
        Report.create([
          { content: 'backfill' },
          { content: 'backfill' },
          { content: 'backfill' }
        ], next);
      },
      function(doc1, doc2, doc3, next) {
        // Travel 10 minutes into the future
        timekeeper.travel(new Date(Date.now() + 300000));
        Report.create([
          { content: 'backfill' },
          { content: 'backfill' }
        ], next);
      },
      function(doc1, doc2, next) {
        // Travel 10 minutes into the future
        timekeeper.travel(new Date(Date.now() + 600000));
        // Create a new trend
        Trend.create({
          _query: Query.hash(new ReportQuery({ keywords: 'backfill' }))
        }, function(err, trend) {
          next(err, trend);
        });
      },
      function(trend, next) {
        trendQueryer = new TrendQueryer({ trend: trend });
        trendQueryer.backFill(next);
      },
      function(counts, next) {
        counts = _.sortBy(counts, 'timebox');
        expect(counts).to.be.an.instanceof(Array);
        expect(counts).to.have.length(2);
        expect(counts[0]).to.have.keys(['timebox', 'counts']);
        expect(counts[0].counts).to.equal(3);
        expect(counts[1]).to.have.keys(['timebox', 'counts']);
        expect(counts[1].counts).to.equal(2);
        setImmediate(next);
      }
    ], done);
  });

  // Clean up
  after(utils.wipeModels([Trend, Report]));
  after(utils.expectModelsEmpty);
});
