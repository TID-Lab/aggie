var request = require('supertest');
var widgetController = require('../../lib/api/v1/widget-controller')();

describe('Widget controller', function() {
  describe('GET /widget/public_incident.map.html', function() {
    it('should return html of the map', function(done) {
      request(widgetController)
        .get('/widget/public_incident_map.html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
  });
});
