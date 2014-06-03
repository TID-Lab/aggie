require('./init');
var expect = require('chai').expect;
var Incident = require('../models/incident');
var IncidentQuery = require('../models/query/incident-query');
var _ = require('underscore');

var query;
describe('Incident query attributes', function() {
  before(function(done) {
    query = new IncidentQuery({
      title: 'Quick Brown'
    });
    Incident.remove(function(err) {
      if (err) return done(err);
      Incident.create({title: 'The quick brown fox', verified: true, status: 'new'});
      Incident.create({title: 'The slow white fox', verified: true, status: 'alert'});
      Incident.create({title: 'The quick brown chicken', verified: false, status: 'working'});
      Incident.create({title: 'The brown quick fox', verified: false, status: 'closed'});
      done();
    });
  });

  it('should normalize query', function() {
    var normalized = query.normalize();
    expect(normalized).to.have.keys(['title', 'locationName', 'assignedTo', 'status', 'verified']);
    expect(normalized.title).to.equal('quick brown');
  });

  it('should hash a query into a string', function() {
    var otherQuery = new IncidentQuery({title: 'Test'});
    var hash = IncidentQuery.hash(otherQuery);
    expect(hash).to.equal('{"title":"test"}');
  });

  it('should compare queries', function() {
    var otherQuery = new IncidentQuery({title: 'qUiCk BrOwN'});
    var similar = IncidentQuery.compare(otherQuery, query);
    expect(similar).to.be.true;
  });

  it('should query by title substring', function(done) {
    (new IncidentQuery({title: 'Quick Brown'})).run(function(err, incidents) {
      if (err) return done(err);
      expect(incidents).to.have.keys(['total', 'results']);
      expect(incidents.total).to.equal(2);
      expect(incidents.results).to.be.an.instanceof(Array);
      expect(incidents.results).to.have.length(2);
      expect(incidents.results[0].title).to.contain('quick brown');
      expect(incidents.results[1].title).to.contain('quick brown');
      done();
    });
  });

  it('should query by verified value', function(done) {
    (new IncidentQuery({verified: true})).run(function(err, incidents) {
      if (err) return done(err);
      expect(incidents).to.have.keys(['total', 'results']);
      expect(incidents.total).to.equal(2);
      expect(incidents.results).to.be.an.instanceof(Array);
      expect(incidents.results).to.have.length(2);
      expect(incidents.results[0].verified).to.be.true;
      expect(incidents.results[0].title).to.contain('The quick brown fox');
      expect(incidents.results[1].verified).to.be.true;
      expect(incidents.results[1].title).to.contain('The slow white fox');
      done();
    });
  });

  it('should query by status value', function(done) {
    (new IncidentQuery({status: 'working'})).run(function(err, incidents) {
      if (err) return done(err);
      expect(incidents).to.have.keys(['total', 'results']);
      expect(incidents.total).to.equal(1);
      expect(incidents.results).to.be.an.instanceof(Array);
      expect(incidents.results).to.have.length(1);
      expect(incidents.results[0].status).to.equal('working');
      expect(incidents.results[0].title).to.contain('The quick brown chicken');
      done();
    });
  });

  it('should query by multiple properties', function(done) {
    (new IncidentQuery({title: 'quick', verified: false})).run(function(err, incidents) {
      if (err) return done(err);
      expect(incidents).to.have.keys(['total', 'results']);
      expect(incidents.total).to.equal(2);
      expect(incidents.results).to.be.an.instanceof(Array);
      expect(incidents.results).to.have.length(2);
      expect(incidents.results[0].title).to.contain('quick');
      expect(incidents.results[0].verified).to.be.false;
      expect(incidents.results[1].title).to.contain('quick');
      expect(incidents.results[1].verified).to.be.false;
      done();
    });
  });
});
