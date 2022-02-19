var request = require('supertest');
var widgetController = require('../../backend/api/controllers/widget-controller')();

describe('Widget controller', function() {
  describe('GET /widget/public_group.map.html', function() {
    it('should return html of the map', function(done) {
      request(widgetController)
        .get('/widget/public_group_map.html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
  });
});
