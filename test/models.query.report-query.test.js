require('./init');
var expect = require('chai').expect;
var ReportQuery = require('../models/query/report-query');

describe('Query attributes', function() {
  before(function() {
    query = new ReportQuery({keywords: 'zero one two three'});
  });

  it('should normalize query', function() {
    var normalized = query.normalize();
    expect(normalized).to.have.property('keywords');
  });

  it('should hash a query into a string', function() {
    var otherQuery = new ReportQuery({keywords: 'three two zero one'});
    var hash = ReportQuery.hash(otherQuery);
    expect(hash).to.equal('{"keywords":"three two zero one"}');
  });

  it('should compare queries', function() {
    var otherQuery = new ReportQuery({keywords: 'zero one two three'});
    var similar = ReportQuery.compare(otherQuery, query);
    expect(similar).to.be.true;
  });
});
