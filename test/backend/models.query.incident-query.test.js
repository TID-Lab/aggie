'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var async = require('async');
var Group = require('../../models/group');
var GroupQuery = require('../../models/query/group-query');

var query;
describe('Group query attributes', function() {
  before(function(done) {
    query = new GroupQuery({
      title: 'Quick Brown'
    });
    Group.remove(function(err) {
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
      ], Group.create.bind(Group), done);
    });
  });

  it('should normalize query', function() {
    var normalized = query.normalize();
    expect(normalized).to.have.keys(['title', 'locationName', 'assignedTo', 'veracity', 'tags']);
    expect(normalized.title).to.equal('quick brown');
  });

  it('should hash a query into a string', function() {
    var otherQuery = new GroupQuery({ title: 'Test' });
    var hash = GroupQuery.hash(otherQuery);
    expect(hash).to.equal('{"title":"test","veracity":null}');
  });

  it('should compare queries', function() {
    var otherQuery = new GroupQuery({ title: 'qUiCk BrOwN' });
    var similar = GroupQuery.compare(otherQuery, query);
    expect(similar).to.be.true;
  });

  it('should query by title substring', function(done) {
    (new GroupQuery({ title: 'The Quick Brown', status: 'closed' })).run(function(err, groups) {
      if (err) return done(err);

      expect(groups).to.have.keys(['total', 'results']);
      expect(groups.total).to.equal(1);
      expect(groups.results).to.be.an.instanceof(Array);
      expect(groups.results).to.have.length(1);
      expect(groups.results[0].title).to.contain('quick brown');
      done();
    });
  });

  it('should query by veracity value', function(done) {
    (new GroupQuery({ veracity: 'Confirmed true' })).run(function(err, groups) {
      if (err) return done(err);
      expect(groups).to.have.keys(['total', 'results']);
      expect(groups.total).to.equal(1);
      expect(groups.results).to.be.an.instanceof(Array);
      expect(groups.results).to.have.length(1);
      expect(groups.results[0].veracity).to.be.true;
      expect(groups.results[0].title).to.contain('The slow white fox');
      done();
    });
  });

  it('should query by status value', function(done) {
    (new GroupQuery({ status: 'open' })).run(function(err, groups) {
      if (err) return done(err);

      expect(groups).to.have.keys(['total', 'results']);
      expect(groups.total).to.equal(1);
      expect(groups.results).to.be.an.instanceof(Array);
      expect(groups.results).to.have.length(1);
      expect(groups.results[0].closed).to.equal(false);
      expect(groups.results[0].title).to.contain('The quick brown chicken');
      done();
    });
  });

  it('should query by multiple properties', function(done) {
    (new GroupQuery({ title: 'quick', status: 'open' })).run(function(err, groups) {
      if (err) return done(err);
      expect(groups).to.have.keys(['total', 'results']);
      expect(groups.total).to.equal(1);
      expect(groups.results).to.be.an.instanceof(Array);
      expect(groups.results).to.have.length(1);
      expect(groups.results[0].title).to.contain('quick');
      done();
    });
  });

  it('should query by single full tag', utils.tagQueryTester('group', ['foobar'], 2));

  it('should query by multiple full tags', utils.tagQueryTester('group', ['wellohorld', 'foobar'], 1));

  after(utils.wipeModels([Group]));
  after(utils.expectModelsEmpty);
});
