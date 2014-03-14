var expect = require('chai').expect;
var CircularQueue = require('../controllers/fetching/circular-queue');

describe('Circular queue', function() {
  before(function(done) {
    queue = new CircularQueue(2);
    done();
  });

  it('should instantiate a new circular queue', function(done) {
    expect(queue.size).to.equal(2);
    expect(queue.length).to.equal(0);
    done();
  });

  it('should add new elements', function(done) {
    queue.add('one');
    queue.add('two');
    expect(queue.length).to.equal(2);
    expect(queue.elements[0]).to.equal('one');
    expect(queue.elements[1]).to.equal('two');
    done();
  });

  it('should fetch elements', function(done) {
    var element = queue.fetch();
    expect(queue.length).to.equal(1);
    expect(element).to.equal('one');
    done();
  });

  it('should overwrite elements', function(done) {
    queue.add('three');
    expect(queue.length).to.equal(2);
    expect(queue.elements[0]).to.equal('three');
    expect(queue.elements[1]).to.equal('two');
    done();
  });

  it('should drop elements', function(done) {
    queue.on('drop', function(dropped) {
      expect(dropped).to.equal('two');
      expect(queue.length).to.equal(2);
      expect(queue.elements[0]).to.equal('three');
      expect(queue.elements[1]).to.equal('four');
      done();
    });
    queue.add('four');
  });

});
