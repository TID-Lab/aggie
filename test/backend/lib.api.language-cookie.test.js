var utils = require('./init');
var expect = require('chai').expect;
var request = require('supertest');
var express = require('express');
var app = express();

before(function() {
  require('../../lib/api/language-cookie.js')(app);
  app.use('/', function(req, res) {
    res.send();
  });
});

describe('Language cookie', function() {
  it('should set the cookie', function(done) {
    request(app)
      .get('/reports')
      .set('Accept-Language', 'en, en-gb;q=0.8, de;q=0.7')
      .expect(200)
      .expect('set-cookie', 'aggie-lang=en; Path=/', done);
  });

  it('should pick the best language', function(done) {
    request(app)
      .get('/reports')
      .set('Accept-Language', 'not-a-language, also-not-a-language;q=0.8, es;q=0.7')
      .expect(200)
      .expect('set-cookie', 'aggie-lang=es; Path=/', done);
  });

  after(utils.expectModelsEmpty);
});
