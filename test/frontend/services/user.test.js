'use strict';

var expect = chai.expect;

describe('User', function() {
  var $httpBackend;

  beforeEach(module('Aggie'));
  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('POST', '/api/v1/user/1').respond({ id: 1 });
  }));

  it('should exist', inject(function(User) {
    expect(User).to.exist;
  }));
});
