require('./init');
var expect = require('chai').expect;
var trendMaster = require('../lib/analytics/trend-master');
var TrendQueryer = require('../lib/analytics/trend-queryer');
var Trend = require('../models/trend');
var Query = require('../models/query');
var Report = require('../models/report');
var _ = require('underscore');

describe('Trend master', function() {
  before(function(done) {
    trendMaster.addListeners('trend', Trend.schema);
    trendMaster.addListeners('report', Report.schema);
    one = new Query({keywords: 'one'});
    one.save();
    two = new Query({keywords: 'two'});
    two.save();
    three = new Query({keywords: 'three'});
    three.save();
    done();
  });

  it('should track all trends', function(done) {
    Trend.create({_query: one._id.toString()});
    Trend.create({_query: two._id.toString()});
    Trend.create({_query: three._id.toString()});
    setTimeout(function() {
      expect(trendMaster).to.have.property('trends');
      expect(trendMaster.trends).to.be.an.instanceof(Array);
      expect(trendMaster.trends).to.have.length(3);
      done();
    }, 100);
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
    var trendId = _.findWhere(trendMaster.trends, {enabled: true})._id;
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
    var trendId = _.findWhere(trendMaster.trends, {enabled: false})._id;
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
    Report.create({content: 'one'});
    Report.create({content: 'one'});
    Report.create({content: 'one'});
    var trendId = _.findWhere(trendMaster.trends, {_query: one._id.toString()})._id;
    trendMaster.query(trendId, function(err, trends, trend) {
      if (err) return done(err);
      expect(trends).to.be.an.instanceof(Array);
      expect(trends).to.have.length(1);
      expect(trends[0]).to.have.keys(['keywords', 'timebox', 'counts']);
      expect(trends[0].keywords).to.contain('one');
      expect(trends[0].counts).to.equal(3);
      done();
    });
  });

  it('should run all queries at specified intervals', function(done) {
    trendMaster.queryAll(100);
    trendMaster.on('error', done);
    var remaining = 9;
    trendMaster.on('data', function(trends) {
      if (--remaining === 0) done();
    });
    Report.create({content: 'one'});
    Report.create({content: 'two'});
    Report.create({content: 'three'});
    setTimeout(function() {
      Report.create({content: 'one'});
      Report.create({content: 'two'});
      Report.create({content: 'three'});
    }, 100);
    setTimeout(function() {
      Report.create({content: 'one'});
      Report.create({content: 'two'});
      Report.create({content: 'three'});
    }, 200);
  });

  it('should remove a trend when deleting it', function(done) {
    Trend.findById(trendMaster.trends[0]._id, function(err, trend) {
      if (err) return done(err);
      trend.remove(function(err, trend) {
        if (err) return done(err);
        expect(trendMaster.trends).to.have.length(2);
        done();
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
