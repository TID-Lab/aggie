'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var _ = require('underscore');
var sourceController = require('../../lib/api/v1/source-controller')();
var Source = require('../../models/source');

describe('Facebook source controller', function() {
  describe('POST /api/v1/source', function() {
    var sources = [
      'nytimes',
      'bbcburmese',
      'NLDParty',
      '134634523373717',
      '308669855916817',
      '150773224985493',
      'MattressFactory',
      'darkmatterpoetry'
    ];

    _.each(sources, function(source_name) {
      it('should create a new facebook source ' + source_name, function(done) {
        var source = {
          nickname: source_name,
          media: 'facebook',
          url: 'https://www.facebook.com/' + source_name
        };

        request(sourceController)
          .post('/api/v1/source')
          .send(source)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.have.property('_id');
            source._id = res.body._id;
            utils.compare(res.body, source);
            done();
          });
      });
    });
  });

  after(utils.wipeModels([Source]));
  after(utils.expectModelsEmpty);
});
