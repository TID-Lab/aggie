var utils = require('./init');
var expect = require('chai').expect;
var async = require('async');
var ReportQuery = require('../../models/query/report-query');
var Report = require('../../models/report');

var query;
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
        }
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

  it('should query by single full tag', utils.tagQueryTester('report', ['RT'], 2));

  it('should query by multiple full tags', utils.tagQueryTester('report', ['NO_RT', 'fast'], 1));
  after(utils.wipeModels([Report]));
  after(utils.expectModelsEmpty);
});
