var utils = require('./init');
var expect = require('chai').expect;
var CircularQueue = require('../../lib/fetching/circular-queue');

describe('Circular queue', function() {
  before(function(done) {
    queue = new CircularQueue(3);
    done();
  });

  it('should instantiate a new circular queue', function(done) {
    expect(queue.capacity).to.equal(3);
    expect(queue.count).to.equal(0);
    expect(queue.drops).to.equal(0);
    expect(queue.peek()).to.be.undefined;
    done();
  });

  it('should add new elements', function(done) {
    queue.add('one');
    queue.add('two');
    expect(queue.count).to.equal(2);
    expect(queue.drops).to.equal(0);
    expect(queue.peek()).to.equal('one');
    done();
  });

  it('should fetch elements', function(done) {
    var one = queue.fetch();
    expect(queue.count).to.equal(1);
    expect(one).to.equal('one');
    expect(queue.peek()).to.equal('two');
    done();
  });

  it('should overwrite elements', function(done) {
    queue.add('three');
    queue.add('four');
    queue.add('five');
    queue.add('six');
    queue.add('seven');
    expect(queue.count).to.equal(3);
    expect(queue.drops).to.equal(3);
    expect(queue.peek()).to.equal('five');
    done();
  });

  it('should fetch newer elements', function(done) {
    var five = queue.fetch();
    var six = queue.fetch();
    var seven = queue.fetch();
    expect(five).to.equal('five');
    expect(six).to.equal('six');
    expect(seven).to.equal('seven');
    expect(queue.count).to.equal(0);
    expect(queue.drops).to.equal(3);
    expect(queue.peek()).to.be.undefined;
    done();
  });

  it('should return undefined when fetching an empty queue', function(done) {
    expect(queue.isEmpty()).to.be.true;
    var eight = queue.fetch();
    expect(eight).to.be.undefined;
    done();
  });

  it('should clear itself', function(done) {
    queue.add('eight');
    queue.add('nine');
    queue.add('ten');
    expect(queue.count).to.equal(3);
    queue.clear();
    expect(queue.count).to.equal(0);
    done();
  });

  after(utils.expectModelsEmpty);
});
