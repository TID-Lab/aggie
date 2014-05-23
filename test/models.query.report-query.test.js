require('./init');
var expect = require('chai').expect;
var ReportQuery = require('../models/query/report-query');

var queryData, queryId;
describe('Query attributes', function() {
  before(function() {
    query = new ReportQuery({keywords: 'zero one two three'});
  });

  it('should normalize query and sort keywords', function() {
    var normalized = query.normalize();
    expect(normalized).to.have.property('keywords');
    expect(normalized.keywords).to.equal('one three two zero');
  });

  it('should hash a query into a string', function() {
    var otherQuery = new ReportQuery({keywords: 'three two zero one'});
    var hash = ReportQuery.hash(otherQuery);
    expect(hash).to.equal('{"keywords":"one three two zero"}');
  });

  it('should compare queries', function() {
    var otherQuery = new ReportQuery({keywords: 'three two zero one'});
    var compare = ReportQuery.compare(otherQuery, query);
    expect(compare).to.be.true;
  });
});
