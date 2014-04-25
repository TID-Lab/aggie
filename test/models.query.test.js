require('./init');
var expect = require('chai').expect;
var Query = require('../models/query');

var queryData, queryId;
describe('Query attributes', function() {
  before(function() {
    query = new Query({type: 'Report', keywords: 'zero one two three'});
  });

  it('should normalize query and sort keywords', function() {
    var normalized = query.normalize();
    expect(normalized).to.have.property('keywords');
    expect(normalized.keywords).to.equal('one three two zero');
  });

  it('should hash a query into a string', function() {
    var hash = Query.hash({type: 'Report', keywords: 'three two zero one'});
    expect(hash).to.equal('{"type":"Report","keywords":"one three two zero"}');
  });

  it('should convert a hash into a query', function() {
    var hash = '{"type":"Report","keywords":"one three zero two"}';
    var unhashed = Query.unhash(hash);
    expect(unhashed).to.have.property('keywords');
    expect(unhashed.keywords).to.equal('one three zero two');
    expect(Query.compare(unhashed, query)).to.be.true;
  });

  it('should compare queries', function() {
    var compare = Query.compare({type: 'Report', keywords: 'three two zero one'}, query);
    expect(compare).to.be.true;
  });
});
