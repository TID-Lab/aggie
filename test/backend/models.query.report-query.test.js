var utils = require('./init');
var expect = require('chai').expect;
var async = require('async');
var ReportQuery = require('../../models/query/report-query');
var Report = require('../../models/report');

describe('Query attributes', function() {
  before(function(done) {
    query = new ReportQuery({ keywords: 'zero one two three' });
    Report.remove(function(err) {
      if (err) return done(err);
      async.each([
        {
          authoredAt: new Date(),
          content: 'Retweet!',
          tags: ['RT']
        },
        {
          authoredAt: new Date(),
          content: 'Retweet from fast source!',
          tags: ['RT']
        },
        {
          authoredAt: new Date(),
          content: 'Original',
          tags: ['NO_RT', 'fast']
        },
        {
          authoredAt: new Date(),
          content: 'Fast',
          tags: ['fast']
        },
      ], Report.create.bind(Report), done);
    });
  });

  it('should normalize query', function() {
    var normalized = query.normalize();
    expect(normalized).to.have.property('keywords');
  });

  it('should hash a query into a string', function() {
    var otherQuery = new ReportQuery({ keywords: 'three two zero one' });
    var hash = ReportQuery.hash(otherQuery);
    expect(hash).to.equal('{"keywords":"three two zero one"}');
  });

  it('should compare queries', function() {
    var otherQuery = new ReportQuery({ keywords: 'zero one two three' });
    var similar = ReportQuery.compare(otherQuery, query);
    expect(similar).to.be.true;
  });

  var reportTagTester = function(tags, n) {
    return function(done) {
      new ReportQuery({
        tags: tags
      }).run(function(err, incidents) {
        if (err) return done(err);
        expect(incidents).to.have.keys(['total', 'results']);
        expect(incidents.total).to.equal(n);
        expect(incidents.results).to.be.an.instanceof(Array);
        expect(incidents.results).to.have.length(n);
        done();
      });
    };
  };
  it('should query by single full tag', reportTagTester(['RT'], 2));

  it('should query by multiple full tags', reportTagTester(['NO_RT', 'fast'], 1));
  after(utils.wipeModels([Report]));
  after(utils.expectModelsEmpty);
});
