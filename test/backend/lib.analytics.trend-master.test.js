var utils = require('./init');
var expect = require('chai').expect;
var trendMaster = require('../../lib/analytics/trend-master');
var TrendQueryer = require('../../lib/analytics/trend-queryer');
var Trend = require('../../models/trend');
var Report = require('../../models/report');
var ReportQuery = require('../../models/query/report-query');
var _ = require('underscore');

describe('Trend master', function() {
  before(function() {
    trendMaster.addListeners('trend', Trend.schema);
    trendMaster.addListeners('report', Report.schema);
  });

  it('should track all trends', function(done) {
    Trend.create({ _query: ReportQuery.hash(new ReportQuery({ keywords: 'one' })) });
    Trend.create({ _query: ReportQuery.hash(new ReportQuery({ keywords: 'two' })) });
    Trend.create({ _query: ReportQuery.hash(new ReportQuery({ keywords: 'three' })) });
    setTimeout(function() {
      expect(trendMaster).to.have.property('trends');
      expect(trendMaster.trends).to.be.an.instanceof(Array);
      expect(trendMaster.trends).to.have.length(3);
      done();
    }, 200);
  });

  it('should instantiate a new trend queryer for each trend', function(done) {
    var remaining = trendMaster.trends.length;
    trendMaster.trends.forEach(function(trend) {
      expect(trend).to.have.property('queryer');
      expect(trend.queryer).to.be.an.instanceof(TrendQueryer);
      if (--remaining === 0) done();
    });
  });

  it('should not load duplicate trends', function(done) {
    var trendId = trendMaster.trends[0]._id;
    trendMaster.load(trendId, function(err, trend) {
      if (err) return done(err);
      expect(trend._id.toString()).to.equal(trendId.toString());
      expect(trendMaster.trends).to.have.length(3);
      done();
    });
  });

  it('should track when trends are disabled', function(done) {
    var trendId = _.findWhere(trendMaster.trends, { enabled: true })._id;
    Trend.findById(trendId, function(err, trend) {
      if (err) return done(err);
      trend.toggle('disable', function(err) {
        if (err) return done(err);
        setTimeout(function() {
          var trend = trendMaster.getTrend(trendId);
          expect(trend).to.have.property('enabled');
          expect(trend.enabled).to.be.false;
          done();
        }, 100);
      });
    });
  });

  it('should track when trends are enabled', function(done) {
    var trendId = _.findWhere(trendMaster.trends, { enabled: false })._id;
    Trend.findById(trendId, function(err, trend) {
      if (err) return done(err);
      trend.toggle('enable', function(err) {
        if (err) return done(err);
        setTimeout(function() {
          var trend = trendMaster.getTrend(trendId);
          expect(trend).to.have.property('enabled');
          expect(trend.enabled).to.be.true;
          done();
        }, 100);
      });
    });
  });

  it('should trigger a trend to run a query', function(done) {
    trendMaster.disable();
    Trend.create({ _query: ReportQuery.hash(new ReportQuery({ keywords: 'four' })) });
    setTimeout(function() {
      Report.create({ content: 'four' });
      Report.create({ content: 'four' });
      Report.create({ content: 'four' });
      Report.create({ content: 'four' });
      setTimeout(function() {
        var trendId = _.findWhere(trendMaster.trends, { _query: '{"keywords":"four"}' })._id;
        trendMaster.enable();
        trendMaster.query(trendId, function(err, trends, trend) {
          if (err) return done(err);
          expect(trends).to.be.an.instanceof(Array);
          expect(trends).to.have.length(1);
          expect(trends[0]).to.have.keys(['timebox', 'counts']);
          expect(trends[0].counts).to.equal(4);
          done();
        });
      }, 500);
    }, 1000);
  });

  it('should run all queries at specified intervals', function(done) {
    trendMaster.queryAll(100);
    trendMaster.on('error', done);
    var remaining = 9;
    trendMaster.on('trend', function(trend) {
      if (--remaining === 0) {
        trendMaster.disable();
        done();
      }
    });
    Report.create({ content: 'one' });
    Report.create({ content: 'two' });
    Report.create({ content: 'three' });
    setTimeout(function() {
      Report.create({ content: 'one' });
      Report.create({ content: 'two' });
      Report.create({ content: 'three' });
    }, 200);
    setTimeout(function() {
      Report.create({ content: 'one' });
      Report.create({ content: 'two' });
      Report.create({ content: 'three' });
    }, 300);
  });

  it('should capture a new trend while queries are queued', function(done) {
    trendMaster.enable();
    trendMaster.queryAll(200);
    trendMaster.on('error', done);
    var remaining = 5;
    var trends = [];
    trendMaster.on('trend', function(trend) {
      trends.push(trend);
      if (--remaining === 0) {
        // Five trends need to run
        expect(trends).to.have.length(5);
        trendMaster.disable();
        done();
      }
    });
    // Create a new trend while queries are running
    Trend.create({ _query: ReportQuery.hash(new ReportQuery({ keywords: 'five' })) }, function(err, trend) {
      if (err) return done(err);
    });
    Report.create({ content: 'one' });
    Report.create({ content: 'two' });
    Report.create({ content: 'three' });
    Report.create({ content: 'four' });
    // Create a report for the new trend to capture
    setTimeout(function() {
      Report.create({ content: 'five' }, function(err, report) {
        if (err) return done(err);
      });
    }, 200);
  });

  it('should remove a trend when deleting it', function(done) {
    Trend.findById(trendMaster.trends[0]._id, function(err, trend) {
      if (err) return done(err);
      trend.remove(function(err, trend) {
        if (err) return done(err);
        expect(trendMaster.trends).to.have.length(4);
        done();
      });
    });
  });

  // Clean up
  after(function() {
    trendMaster.trends = [];
    trendMaster.disable();
    trendMaster.removeListeners('trend', Trend.schema);
    trendMaster.removeListeners('report', Report.schema);
  });

  after(utils.wipeModels([Trend, Report]));
  after(utils.expectModelsEmpty);
});
