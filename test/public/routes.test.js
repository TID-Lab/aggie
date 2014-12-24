'use strict';

var expect = chai.expect;

describe('routes', function() {
  beforeEach(module('Aggie'));
  beforeEach(module('aggie.templates'));

  it('should trasition to login', inject(function($state, $rootScope) {
    $state.transitionTo('login');
    $rootScope.$apply();

    expect($state.current.name).to.equal('login');
    expect($state.current.controller).to.equal('LoginController');
  }));
});