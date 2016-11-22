'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var async = require('async');
var Incident = require('../../models/incident');
var IncidentQuery = require('../../models/query/incident-query');

var query;
describe('Incident query attributes', function() {
  before(function(done) {
    query = new IncidentQuery({
      title: 'Quick Brown'
    });
    Incident.remove(function(err) {
      if (err) return done(err);
      async.each([
        {
          title: 'The quick brown fox',
          veracity: null,
          closed: true,
          tags: ['hello', 'world']
        },
        {
          title: 'The slow white fox',
          veracity: true,
          closed: false,
          tags: ['hello']
        },
        {
          title: 'The quick brown chicken',
          veracity: null,
          closed: false,
          tags: ['world']
        },
        {
          title: 'The brown quick fox',
          veracity: false,
          closed: true,
          tags: ['helloworld', 'wellohorld', 'foobar']
        },
        {
          title: 'The fox that was slow and brown',
          veracity: false,
          closed: true,
          tags: ['foobar', 'hello']
        },
        {
          title: 'The slow that was fox and brown',
          veracity: false,
          closed: true,
          tags: ['wellohorld', 'hello']
        }
      ], Incident.create.bind(Incident), done);
    });
  });

  it('should normalize query', function() {
    var normalized = query.normalize();
    expect(normalized).to.have.keys(['title', 'locationName', 'assignedTo', 'veracity', 'tags']);
    expect(normalized.title).to.equal('quick brown');
  });

  it('should hash a query into a string', function() {
    var otherQuery = new IncidentQuery({ title: 'Test' });
    var hash = IncidentQuery.hash(otherQuery);
    expect(hash).to.equal('{"title":"test","veracity":null}');
  });

  it('should compare queries', function() {
    var otherQuery = new IncidentQuery({ title: 'qUiCk BrOwN' });
    var similar = IncidentQuery.compare(otherQuery, query);
    expect(similar).to.be.true;
  });

  it('should query by title substring', function(done) {
    (new IncidentQuery({ title: 'The Quick Brown', status: 'closed' })).run(function(err, incidents) {
      if (err) return done(err);

      expect(incidents).to.have.keys(['total', 'results']);
      expect(incidents.total).to.equal(1);
      expect(incidents.results).to.be.an.instanceof(Array);
      expect(incidents.results).to.have.length(1);
      expect(incidents.results[0].title).to.contain('quick brown');
      done();
    });
  });

  it('should query by veracity value', function(done) {
    (new IncidentQuery({ veracity: 'Confirmed true' })).run(function(err, incidents) {
      if (err) return done(err);
      expect(incidents).to.have.keys(['total', 'results']);
      expect(incidents.total).to.equal(1);
      expect(incidents.results).to.be.an.instanceof(Array);
      expect(incidents.results).to.have.length(1);
      expect(incidents.results[0].veracity).to.be.true;
      expect(incidents.results[0].title).to.contain('The slow white fox');
      done();
    });
  });

  it('should query by status value', function(done) {
    (new IncidentQuery({ status: 'open' })).run(function(err, incidents) {
      if (err) return done(err);

      expect(incidents).to.have.keys(['total', 'results']);
      expect(incidents.total).to.equal(1);
      expect(incidents.results).to.be.an.instanceof(Array);
      expect(incidents.results).to.have.length(1);
      expect(incidents.results[0].closed).to.equal(false);
      expect(incidents.results[0].title).to.contain('The quick brown chicken');
      done();
    });
  });

  it('should query by multiple properties', function(done) {
    (new IncidentQuery({ title: 'quick', status: 'open' })).run(function(err, incidents) {
      if (err) return done(err);
      expect(incidents).to.have.keys(['total', 'results']);
      expect(incidents.total).to.equal(1);
      expect(incidents.results).to.be.an.instanceof(Array);
      expect(incidents.results).to.have.length(1);
      expect(incidents.results[0].title).to.contain('quick');
      done();
    });
  });

  it('should query by single full tag', utils.tagQueryTester('incident', ['foobar'], 2));

  it('should query by multiple full tags', utils.tagQueryTester('incident', ['wellohorld', 'foobar'], 1));

  after(utils.wipeModels([Incident]));
  after(utils.expectModelsEmpty);
});
